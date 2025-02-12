import OpenAI from 'openai'
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources'
import { collectionGetAll, collectionGetBy, collectionInsert, collectionReference, DBItem } from 'src/firebase'
import { AiModel, OpenAiCompletion } from 'src/types/entities'
import { getChatHistory } from './history'
import { validateFlResponse } from './zod'
import { CompletionOutput } from './types'
import { orderBy } from 'firebase/firestore'

const defaultCompletionBody: Partial<ChatCompletionCreateParamsNonStreaming> = {
  // max_tokens: 500,
  temperature: 1,
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'email_schema',
      schema: {
        type: 'object',
        properties: {
          message: {
            description: 'message appears in the output',
            type: 'string',
          },
          system: {
            type: 'object',
            description: 'json appears in the output',
            properties: {
              system: {
                description: 'system appears in the output',
                type: 'object'
              }
            },
            additionalProperties: false
          },
          json: {
            type: 'object',
            description: 'json appears in the output',
            properties: {
              system: {
                description: 'system appears in the output',
                type: 'string'
              }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    }
  }
}

const singleCompletion = async (openai: OpenAI, input: ChatCompletionCreateParamsNonStreaming) => {
  const body = Object.assign({}, defaultCompletionBody, input)
  return await openai.chat.completions.create(body)
}

const validateCompletionResponse = (output: Partial<CompletionOutput>, validateResponse: (data: unknown) => boolean | unknown): string[] => {
  const errors = []
  if (typeof output?.message !== 'string') {
    errors.push('no message')
  }
  // todo - review zod interaction
  const v = validateResponse(output)
  if (v !== true) {
    errors.push(v)
  }
  return errors
}

const attemptCompletion = async (openai: OpenAI, input: ChatCompletionCreateParamsNonStreaming, maxAttempts: number = 1, attempt: number = 1) => {
  if (attempt > maxAttempts) {
    throw new Error(`attempts limit exceeded: ${attempt}`)
  }

  const output = await singleCompletion(openai, input)
  const content = output.choices.find(c => c.message.role === 'assistant')?.message?.content ?? null

  let errors = []

  try {
    const json = JSON.parse(content)
    errors = validateCompletionResponse(json, validateFlResponse)
  } catch (error) {
    attempt++
    console.error('cannot parse completion', error)
    errors.push(`output json parse error: ${error}. fix format and try again. this will be an attempt #${attempt} of ${maxAttempts}. after this I will stop asking you and consider you cannot make a correct answer`)
  }

  if (!errors.length) {
    return output
  }

  attempt++

  console.warn('output json validation mistakes', errors)

  input.messages.push({
    role: 'assistant',
    content
  }, {
    role: 'user',
    content: `output json validation mistakes found: ${JSON.stringify(errors)}. fix format and try again. this is attempt ${attempt}`
  })

  return attemptCompletion(openai, input, maxAttempts, attempt)
}

export const chat = async (openai: OpenAI, req: OpenAiCompletion) => {
  const { context, user, chat, modelName, historyLimit, maxAttempts, prompt } = req
  const dbModel = await collectionGetBy<AiModel>('aiModels', 'name', modelName)

  if (!dbModel || !dbModel.openaiId) {
    throw new Error(`model "${modelName}" not found`)
  }

  const chatHistory = (await getChatHistory(user, chat, historyLimit)).map(m => ({
    role: m.role,
    content: m.content
  }))

  const systemMessage = (await collectionGetAll<DBItem & { msg: string }>('systemMessages', [orderBy('priority', 'desc')])).map(m => m.msg).join('\\n\\n')

  const messages = [
    { role: 'system', content: context ?? '' },
    { role: 'user', content: prompt }
  ]
  const input = {
    model: dbModel.openaiId,
    messages: [
      { role: 'system', content: systemMessage },
      ...(chatHistory ?? []),
      ...messages
    ],
  } as ChatCompletionCreateParamsNonStreaming

  const output = await attemptCompletion(openai, input, maxAttempts)

  const content = output.choices.find(c => c.message.role === 'assistant')?.message?.content ?? null

  const usage = {
    completion_tokens: output.usage.completion_tokens,
    prompt_tokens: output.usage.prompt_tokens,
    total_tokens: output.usage.total_tokens
  }

  const completionObj = {
    input,
    output,
    model: modelName,
    user,
    chat
  }
  const completion = await collectionInsert('chatCompletions', completionObj)

  const msgUser = {
    role: 'user',
    content: prompt,
    user,
    chat,
    usage,
    completion: collectionReference('chatCompletions', completion.id)
  }
  await collectionInsert('chatMessages', msgUser)

  const msgAssist = {
    role: 'assistant',
    content,
    user,
    chat,
    usage,
    completion: collectionReference('chatCompletions', completion.id)
  }

  return collectionInsert('chatMessages', msgAssist)
}
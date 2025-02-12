import OpenAI from 'openai'
import { Uploadable } from 'openai/uploads'
import { collectionUpdateItem } from 'src/firebase'
import { FineTune, AiChatRequest as AiChatRequest } from 'src/types/entities'
import { chat } from './chat'
import { AiConfig } from './types'

class AiCore {

  private readonly openai: OpenAI

  private readonly config: AiConfig

  constructor(config: AiConfig) {
    this.config = config

    this.openai = new OpenAI({ apiKey: this.config.apiKey })
  }

  public chat = async (req: AiChatRequest) => chat(this.openai, {
    historyLimit: 20,
    maxAttempts: 4,
    ...req
  })

  public fineTune = async (training_file: string, model: string) => {
    try {
      return this.openai.fineTuning.jobs.create({
        training_file,
        model
        // todo - set when create new model
        // suffix: 'flai-app-builder'
      })
    } catch (error) {
      console.error('uploadTrainingFile error:', error)
      throw error
    }
  }

  public uploadTrainingFile = async (file: Uploadable) => {
    try {
      return this.openai.files.create({ purpose: 'fine-tune', file })
    } catch (error) {
      console.error('uploadTrainingFile error:', error)
      throw error
    }
  }

  public getJobStatus = async (jobId: string) => {
    try {
      return await this.openai.fineTuning.jobs.retrieve(jobId)
    } catch (error) {
      console.error('getJobStatus error:', error)
      throw error
    }
  }

  public checkJobStatuses = async (fineTunes: FineTune[]) => {
    let statusChanged = false

    // todo - use shared enum
    const endStatuses = [
      'succeeded',
      'failed',
      'canceled'
    ]

    const toCheck = fineTunes.filter(f => !endStatuses.includes(f.status) || (f.status === 'succeeded' && !f.openaiId))

    for (let f of toCheck) {
      try {
        const currentStatus = f.status
        const openaiJobResponse = await this.getJobStatus(f.openaiJobId)
        const openaiId = openaiJobResponse.fine_tuned_model ?? undefined

        f.openaiJobResponse = openaiJobResponse

        await collectionUpdateItem('fineTunes', f.id, {
          openaiJobResponse,
          status: openaiJobResponse.status
        })

        if (!f.openaiId && openaiId) {
          await collectionUpdateItem('fineTunes', f.id, { openaiId })
          await collectionUpdateItem('aiModels', f.aiModel, { openaiId })
          f.openaiId = openaiId
        }

        if (currentStatus !== openaiJobResponse.status) {
          f.status = openaiJobResponse.status
          statusChanged = true
        }
      } catch (e) {
        console.log(e)
        throw e
      }
    }
    return statusChanged
  }
}

export default AiCore
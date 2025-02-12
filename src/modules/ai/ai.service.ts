import { Injectable } from '@nestjs/common'
import { FineTune, FineTuneCreate, AiChatRequest } from 'src/types/entities'
import AiCore from 'src/libs/ai'
import { collectionDelete, collectionGetAll, collectionGetById, collectionInsert, collectionUpdateItem } from 'src/firebase'
import { orderBy } from 'firebase/firestore'
import { getChatHistory } from 'src/libs/ai/history'
import { ConfigService } from '@nestjs/config'
import { createReadStream } from 'src/libs/fs'
import { ConfigPathsService } from '../common/config-paths.service'
import { Uploadable } from 'openai/uploads'

@Injectable()
export class AiService {

  private readonly trainingFilesPath: string

  private readonly ai: AiCore

  constructor(private readonly configService: ConfigService, private readonly configPaths: ConfigPathsService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY in environment variables')
    }
    this.ai = new AiCore({ apiKey })
    this.trainingFilesPath = configPaths.trainingFilesPath
  }

  chat = async (req: AiChatRequest) => this.ai.chat(req)

  history = async (user: string, chat: string) => getChatHistory(user, chat)

  clearChat = async (user: string, chat: string) => getChatHistory(user, chat)

  deletemessages = async (ids: string[]) => collectionDelete('chatMessages', ids)

  getFineTunes = async () => {
    const items: FineTune[] = await collectionGetAll<FineTune>('fineTunes', [orderBy('_created', 'desc')]) // todo - filter request by status
    const statusChange = await this.ai.checkJobStatuses(items)
    if (statusChange) {
      return await collectionGetAll<FineTune>('fineTunes', [orderBy('_created', 'desc')])
    }
    return { items }
  }

  createModel = async (name: string, model: string) => collectionInsert('aiModels', {
    name,
    baseModel: model,
    openaiId: model
  })

  finetune = async (modelId: string, fileId: string) => {
    const aiModel = await collectionGetById<{ id: string, fileName: string, openaiId: string }>('aiModels', modelId)
    const file = await collectionGetById<{ id: string, fileName: string, openaiId: string }>('trainingFiles', fileId)
    if (aiModel && file) {

      if (!file.openaiId) {
        const filePath = `${this.trainingFilesPath}/${file.fileName}`
        const fileStream: Uploadable = await createReadStream(filePath)
        const uploadedFile = await this.ai.uploadTrainingFile(fileStream)
        await collectionUpdateItem('trainingFiles', file.id, {
          uploadedFile: uploadedFile,
          openaiId: uploadedFile.id
        })
        file.openaiId = uploadedFile.id
      }

      const jobResponse = await this.ai.fineTune(file.openaiId, aiModel.openaiId)

      await collectionInsert<FineTuneCreate>('fineTunes', {
        name: 'test ' + new Date(),
        description: '',
        aiModel: aiModel.id,
        trainingFile: file.id,
        trainingFileName: file.fileName,
        openaiJobId: jobResponse.id,
        openaiJobResponse: jobResponse,
        status: jobResponse.status
      })
    } else {
      throw new Error('File not found')
    }
  }
}
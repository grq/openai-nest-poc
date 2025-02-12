import { DBItem } from 'src/firebase'

export interface AiConfig {
  apiKey: string
}

export type AiMessage = unknown

export type TrainingDataItem = {
  id: string,
  messages: AiMessage[],
  tags: string[],
  trainingFile?: string
}


export type TrainingData = {
  id: string,
  messages: AiMessage[],
  tags: string[]
}

export type TrainingFile = DBItem & {
  fileName: string,
  title: string,
  description: string,
  messages: TrainingData[],
  tags: string[]
}

export type CompletionOutput = { message: string }
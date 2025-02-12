// export interface Customer {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   photo: string; // URL of the photo
//   birthDate: string; // ISO format date
//   created: string; // ISO format date
//   comment: string;
//   status: 'active' | 'inactive' | 'pending'; // Example statuses
//   origin: string; // E.g., 'referral', 'ad', etc.
//   telegram: string; // Telegram username or link
//   whatsapp: string; // WhatsApp number or link
// }

export type AiChatRequest = {
  user: string
  chat: string
  modelName: string
  prompt: string
  context?: unknown
}

export type OpenAiCompletion = AiChatRequest & {
  historyLimit: number
  maxAttempts: number
}

export type BaseItem = {
  id: string

  _created: string
}

export interface FineTuneCreate {
  name: string
  description: string
  aiModel: string
  trainingFile: string
  trainingFileName: string
  openaiJobId: string
  openaiJobResponse: unknown
  status: string
  openaiId?: string
  openaiModelInfo?: unknown
}

export type FineTune = FineTuneCreate & BaseItem

export interface AiModel {
  openaiId: string
}

export interface ChatMessageCreate {
  role: string
  content: undefined
}

export type ChatMessage = ChatMessageCreate & BaseItem
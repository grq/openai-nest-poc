import { limit, orderBy, QueryConstraint, where } from 'firebase/firestore'
import { collectionClear, collectionGetAll } from 'src/firebase'
import { ChatMessage } from 'src/types/entities'

export const clearChatHistory = async (user: string, chat: string) => {
  const inp: QueryConstraint[] = [
    where('user', '==', user),
    where('chat', '==', chat)
  ]
  await collectionClear('chatMessages', inp)
  await collectionClear('chatCompletions', inp)
}
export const getChatHistory = async (user: string, chat: string, lim: number | null = null, desc: boolean = false) => {
  const inp: QueryConstraint[] = [
    where('user', '==', user),
    where('chat', '==', chat),
    orderBy('_created', desc ? 'desc' : 'asc')
  ]

  if (lim) {
    inp.push(limit(lim))
  }

  return await collectionGetAll<ChatMessage>('chatMessages', inp)
}
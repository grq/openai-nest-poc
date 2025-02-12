import { Injectable } from '@nestjs/common'
import { orderBy } from 'firebase/firestore'
import { collectionGetAll, collectionInsertMany } from 'src/firebase'
@Injectable()
export class ApiService {

  async dashboard() {
    return []
  }
  async getall(cid: string) {
    try {
      const items = await collectionGetAll(cid, [orderBy('_created', 'desc')])
      return { items }
    } catch (e) {
      console.error(e)
    }
  }

  async create(cid: string, items: unknown[]) {
    try {
      return collectionInsertMany(cid, items)
    } catch (e) {
      console.error(e)
    }
  }
}

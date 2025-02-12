import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, addDoc, WithFieldValue, serverTimestamp, doc, deleteDoc, writeBatch, updateDoc, getDoc, DocumentData, query, QueryConstraint, where } from 'firebase/firestore'

export type DBItem = { id: string }

class FsProvider {

  private _db

  private _app

  private _auth

  public init = (firebaseConfig: unknown) => {
    this._app = initializeApp(firebaseConfig)
    this._db = getFirestore(this._app)
    this._auth = getAuth(this._app)
  }

  public db = () => {
    if (!this._db) {
      throw new Error('not initialized')
    }
    return this._db
  }

  public auth = () => {
    if (!this._auth) {
      throw new Error('not initialized')
    }
    return this._auth
  }
}

const db = new FsProvider()

export const getFsAuth = db.auth

export const initFirebaseDb = db.init


export const collectionGetAll = async <T extends DBItem>(cid: string, filters: QueryConstraint[] = []): Promise<T[]> => {
  try {
    const collectionRef = collection(db.db(), cid)
    const queryResult = query(collectionRef, ...(filters as QueryConstraint[]))
    const snapshot = await getDocs(queryResult)
    if (snapshot.empty) {
      console.log(`No documents found in the collection "${cid}".`, filters)
      return []
    }
    return snapshot.docs.map(doc => {
      const data = doc.data()
      if (data._created) {
        data._created = data._created.toDate().toISOString()
      }
      return { id: doc.id, ...data }
    }) as T[]
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const collectionInsert = async <T = unknown>(cid: string, item: Partial<T>): Promise<{ id: string } & T> => {
  return (await collectionInsertMany(cid, [item]))[0]
}

export const collectionInsertMany = async <T = unknown>(cid: string, items: Partial<T>[]): Promise<Array<{ id: string } & T>> => {
  const collectionRef = collection(db.db(), cid)
  const batch = writeBatch(db.db())

  const results: Array<{ id: string } & T> = []

  try {
    for (let item of items) {
      const docRef = await addDoc(collectionRef, {
        ...item,
        _created: serverTimestamp()
      })

      const docData = {
        id: docRef.id,
        ...item,
        _created: serverTimestamp()
      }

      batch.set(docRef, docData as unknown as WithFieldValue<T>)
      results.push(docData as unknown as { id: string } & T)
    }

    await batch.commit()
    console.log(`Successfully added ${items.length} documents to ${cid}`)
    return results
  } catch (error) {
    console.error(`Error adding multiple documents to "${cid}":`, error)
    throw error
  }
}

export const collectionClear = async (cid: string, filters: QueryConstraint[] = []): Promise<void> => {
  try {
    const collectionRef = collection(db.db(), cid)
    const queryResult = query(collectionRef, ...(filters as QueryConstraint[]))
    const snapshot = await getDocs(queryResult)

    if (snapshot.empty) {
      console.log(`No documents found in the collection "${cid}".`)
      return
    }

    const deletePromises = snapshot.docs.map((docSnapshot) => {
      const docRef = doc(db.db(), cid, docSnapshot.id)
      return deleteDoc(docRef)
    })

    await Promise.all(deletePromises)
    console.log(`All documents in the "${cid}" collection have been deleted.`)
  } catch (error) {
    console.error(`Error clearing collection "${cid}":`, error)
    throw error
  }
}

export const collectionDelete = async (cid: string, ids: string[]): Promise<void> => {
  if (!ids.length) {
    console.log(`No IDs provided for deletion in collection "${cid}".`)
    return
  }

  try {
    const batch = writeBatch(db.db())

    ids.forEach((id) => {
      const docRef = doc(db.db(), cid, id)
      batch.delete(docRef)
    })

    await batch.commit()

    console.log(`Deleted ${ids.length} documents from "${cid}".`)
  } catch (error) {
    console.error(`Error deleting documents in "${cid}":`, error)
    throw error
  }
}

export const updateDocuments = async (cid: string, ids: string[], value: unknown) => {
  const batch = writeBatch(db.db())

  ids.forEach((id) => {
    const docRef = doc(db.db(), cid, id)
    batch.update(docRef, value)
  })

  try {
    await batch.commit()
    console.log('Batch update successful')
  } catch (error) {
    console.error('Error updating documents:', error)
  }
}

export const collectionUpdateItem = async <T = unknown>(cid: string, id: string, item: Partial<T>): Promise<void> => {
  const docRef = doc(db.db(), cid, id)
  try {
    await updateDoc(docRef, item as DocumentData)
    console.log(`Document with ID "${id}" in collection "${cid}" has been updated.`)
  } catch (error) {
    console.error(`Error updating document "${id}" in collection "${cid}":`, error)
    throw error
  }
}

export const collectionGetById = async <T = unknown>(cid: string, id: string): Promise<T | null> => {
  const docRef = doc(db.db(), cid, id)
  try {
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T
    } else {
      console.log(`Document with ID "${id}" not found in collection "${cid}".`)
      return null
    }
  } catch (error) {
    console.error(`Error getting document "${id}" from collection "${cid}":`, error)
    throw error
  }
}


export const collectionGetBy = async <T = unknown>(cid: string, prop: string, value: string): Promise<T | null> => {
  if (prop === 'id') {
    return collectionGetById(cid, value)
  }
  const collectionRef = collection(db.db(), cid)
  const q = query(collectionRef, where(prop, '==', value))
  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    console.log(`No documents found with ${prop} = ${value}`)
    return null
  }
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))[0] as T
}

export const collectionReference = (cid: string, value: string) => doc(collection(db.db(), cid), value)
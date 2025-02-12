import { Injectable } from '@nestjs/common'
import { collectionGetAll, collectionInsert, updateDocuments } from 'src/firebase'
import { where } from 'firebase/firestore'
import { accessOrCreate, fileData, listLocalDirectory, readFile } from 'src/libs/fs'
import { generateJSONL } from 'src/libs/jsonl'
import { ConfigPathsService } from '../common/config-paths.service'
import { TrainingFile } from 'src/libs/ai/types'

@Injectable()
export class FsService {

  private defaultFilesPath: string = './_tmp'

  private jsonFilesPath: string

  private trainingFilesPath: string

  private docsFilesPath: string

  constructor(private readonly configPaths: ConfigPathsService) {
    this.jsonFilesPath = this.configPaths.jsonFilesPath
    this.trainingFilesPath = this.configPaths.trainingFilesPath
    this.docsFilesPath = this.configPaths.docsFilesPath
  }

  async jsonFiles() {
    try {
      const fileNames = await listLocalDirectory(this.jsonFilesPath)
      const files = []

      for (const fileName of fileNames) {
        const filePath = `${this.jsonFilesPath}/${fileName}`
        const fileStat = await fileData(filePath)

        if (fileStat.isFile()) {
          files.push({ fileName, filePath, fileStat })
        }
      }

      files.sort((a, b) => b.fileStat.mtime.getTime() - a.fileStat.mtime.getTime())

      for (const file of files) {
        if (file.fileStat.isFile()) {
          const fileData = await readFile(file.filePath)
          try {
            file.data = JSON.parse(fileData)
            file.data.forEach(d => {
              d.messages.forEach(m => {
                if (!m.role || !m.content) {
                  console.error('Invalid training date', d, m)
                  throw new Error('Invalid training date')
                }
              })
            })
          } catch (e) {
            console.error(e)
            throw e
          }
        }
      }

      return files
    } catch (error) {
      console.error('Error reading or parsing files:', error)
      return []
    }
  }

  async docsFiles<T = unknown>() {
    try {
      const result: T[] = []

      const fileNames = await listLocalDirectory(this.docsFilesPath)
      const files = []

      for (const fileName of fileNames) {
        const filePath = `${this.docsFilesPath}/${fileName}`
        const fileStat = await fileData(filePath)

        if (fileStat.isFile()) {
          files.push({ fileName, filePath, fileStat })
        }
      }

      files.sort((a, b) => b.fileStat.mtime.getTime() - a.fileStat.mtime.getTime())

      for (const file of files) {
        if (file.fileStat.isFile()) {
          const parsedData = await import(`../.${this.docsFilesPath}/${file.fileName}`)

          file.data = parsedData

          if (Array.isArray(parsedData)) {
            result.push(...parsedData)
          }
        }
      }

      return files
    } catch (error) {
      console.error('Error reading or parsing files:', error)
      return []
    }
  }

  async createtrainingfile(fileName: string, ids: string[]) {
    const data = await collectionGetAll<TrainingFile>('trainingData', [where('trainingFile', '==', null)])

    fileName = fileName + '.jsonl'
    const filePath = `${this.trainingFilesPath}/${fileName}`

    await accessOrCreate(this.trainingFilesPath)

    try {
      let tags: string[] = []
      const messages = data.map((di) => {
        tags.push(...(di?.tags ?? []))
        return { messages: di.messages }
      })

      await generateJSONL(filePath, messages)

      console.log(`Training file created at: ${filePath}`)

      tags = [...(new Set(tags))]

      const trainingFile = await collectionInsert('trainingFiles', {
        fileName: fileName,
        name: '// todo -',
        description: '// todo -',
        tags
      })
      await updateDocuments('trainingData', ids, { trainingFile: trainingFile.id })
      return trainingFile
    } catch (error) {
      console.error('Error creating training file:', error)
      throw error
    }
  }
}
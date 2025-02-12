import { writeFile } from '../fs'

export const generateJSONL = async (filePath: string, data: object[]) => {
  try {
    const jsonlContent = data.map(item => JSON.stringify(item)).join('\n')
    await writeFile(filePath, jsonlContent)
  } catch (error) {
    console.error('error creating jsonl:', error)
  }
}
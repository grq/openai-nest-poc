import * as fsnorm from 'fs'
const fs = require('fs/promises')

export const listLocalDirectory = async (path: string): Promise<string[]> => fs.readdir(path)

export const fileData = async (path: string) => fs.stat(path)

export const readFile = async (path: string) => fs.readFile(path, 'utf-8')

export const writeFile = async (path: string, file: string) => fs.writeFile(path, file, 'utf-8')

export const accessOrCreate = async (path: string) => {
  try {
    await fs.access(path)
  } catch {
    await fs.mkdir(path, { recursive: true })
    return accessOrCreate(path)
  }
}

export const createReadStream = async <T>(path: string) => fsnorm.createReadStream(path) as T
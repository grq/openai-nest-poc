import * as fs from 'fs'
import * as fsPromises from 'fs/promises'
import * as path from 'path'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import type { Express } from 'express'

@Injectable()
export class WhisperService {
  private openai: OpenAI

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY in environment variables')
    }
    this.openai = new OpenAI({ apiKey })
  }

  async transcribeAudio(file: Express.Multer.File): Promise<string> {
    const tempDir = path.join('./_temp')
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${file.originalname}`)

    try {
      if (!fs.existsSync(tempDir)) {
        await fsPromises.mkdir(tempDir, { recursive: true })
      }

      await fsPromises.writeFile(tempFilePath, file.buffer)

      const response = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1'
      })

      return response.text
    } catch (error) {
      console.error('Error transcribing audio:', error)
      throw error
    } finally {
      try {
        await fsPromises.unlink(tempFilePath)
      } catch (unlinkError) {
        console.error('Failed to delete temporary file:', unlinkError)
      }
    }
  }
}
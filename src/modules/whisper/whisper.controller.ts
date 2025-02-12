import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { WhisperService } from './whisper.service'
import type { Express } from 'express'

export interface TranscribeAudio {
  transcript?: string
  details?: string
  error?: string
}

@Controller('whisper')
export class WhisperController {
  constructor(private readonly whisperService: WhisperService) {}

    @Post('transcribe')
    @UseInterceptors(FileInterceptor('file'))
  async transcribeAudio(@UploadedFile() file: Express.Multer.File): Promise<TranscribeAudio> {
    if (!file) {
      return { error: 'No file uploaded' }
    }

    try {
      const transcript = await this.whisperService.transcribeAudio(file)
      return { transcript }
    } catch (error) {
      return { error: 'Error transcribing audio', details: error.message }
    }
  }
}
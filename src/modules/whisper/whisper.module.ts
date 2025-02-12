import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { WhisperService } from './whisper.service'
import { WhisperController } from './whisper.controller'

@Module({
  imports: [ConfigModule],
  providers: [WhisperService],
  controllers: [WhisperController],
})
export class WhisperModule {}
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MulterModule } from '@nestjs/platform-express'
import { ApiModule } from './modules/api/api.module'
import { WhisperModule } from './modules/whisper/whisper.module'
import { AiModule } from './modules/ai/ai.module'
import { AuthModule } from './modules/auth/auth.module'
import { FsModule } from './modules/fs/fs.module'

@Module({
  imports: [
    AuthModule,
    ApiModule,
    ConfigModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
    }),
    WhisperModule,
    AiModule,
    FsModule
  ],
})
export class AppModule { }

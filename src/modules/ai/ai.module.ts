import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [ConfigModule.forRoot(), CommonModule],
  controllers: [AiController],
  providers: [AiService]
})
export class AiModule { }

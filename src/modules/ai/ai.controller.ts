import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { AiService } from './ai.service'
import { JwtAuthGuard } from '../../shared/jwt-auth.guard'
import { AiChatRequest } from 'src/types/entities'

@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) { }

  @UseGuards(JwtAuthGuard)
  @Post('flaichat')
  async chat(@Body() body: AiChatRequest) {
    return this.service.chat(body)
  }

  @UseGuards(JwtAuthGuard)
  @Post('history')
  async history(@Body() body: { user: string, chat: string }) {
    return this.service.history(body.user, body.chat)
  }

  @UseGuards(JwtAuthGuard)
  @Post('deletemessages')
  async deletemessages(@Body() body: { ids: string[] }) {
    return this.service.deletemessages(body.ids)
  }

  @UseGuards(JwtAuthGuard)
  @Post('getfinetunes')
  async getFineTunes() {
    return this.service.getFineTunes()
  }

  @UseGuards(JwtAuthGuard)
  @Post('finetune')
  async finetune(@Body() body: { model: string, trainingFile: string }) {
    return this.service.finetune(body.model, body.trainingFile)
  }
}

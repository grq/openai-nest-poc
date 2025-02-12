import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { FsService } from './fs.service'
import { JwtAuthGuard } from '../../shared/jwt-auth.guard'

@Controller('fs')
export class FsController {
  constructor(private readonly service: FsService) { }

  @UseGuards(JwtAuthGuard)
  @Post('jsonfiles')
  async jsonFiles() {
    return this.service.jsonFiles()
  }

  @UseGuards(JwtAuthGuard)
  @Post('docsfiles')
  async docsFiles() {
    return this.service.docsFiles()
  }

  @UseGuards(JwtAuthGuard)
  @Post('createtrainingfile')
  async createtrainingfile(@Body() body: { fileName: string, ids: string[] }) {
    return this.service.createtrainingfile(body.fileName, body.ids)
  }
}

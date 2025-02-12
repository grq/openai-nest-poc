import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiService } from './api.service'
import { JwtAuthGuard } from '../../shared/jwt-auth.guard'

@Controller('api')
export class ApiController {
  constructor(private readonly service: ApiService) { }

  @UseGuards(JwtAuthGuard)
  @Post('dashboard')
  async dashboard() {
    return this.service.dashboard()
  }

  @UseGuards(JwtAuthGuard)
  @Post('getall')
  async getall(@Body() body: { cid: string }) {
    return this.service.getall(body.cid)
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() body: { cid: string, items: unknown[] }) {
    return this.service.create(body.cid, body.items)
  }
}

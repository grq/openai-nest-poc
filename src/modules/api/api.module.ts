import { Module } from '@nestjs/common'
import { ApiService } from './api.service'
import { ApiController } from './api.controller'
import { JwtModule } from '@nestjs/jwt'
import { JwtAuthGuard } from 'src/shared/jwt-auth.guard'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key',
      signOptions: { expiresIn: '1h' }
    })
  ],
  providers: [ApiService, JwtAuthGuard],
  controllers: [ApiController],
})
export class ApiModule { }

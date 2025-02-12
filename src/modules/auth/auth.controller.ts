import { Controller, Post, Body, UseGuards, Request, Res } from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from 'src/shared/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }, @Res() res: Response) {
    try {
      const { accessToken } = await this.authService.login(loginDto)

      res.cookie('accessToken', accessToken, {
        // httpOnly: true, // Защищает от XSS-атак
        secure: false, // true, // Только по HTTPS
        sameSite: 'lax', // 'strict', // Предотвращает CSRF-атаки
        maxAge: 60 * 60 * 1000, // 1 час жизни куки
      })

      return res.status(200).json({ message: 'Login successful' })
    } catch (e) {
      return res.status(401).json(!e)
    }
  }

  @Post('register')
  async register(@Body() loginDto: { email: string; password: string }) {
    return this.authService.register(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user
  }
}

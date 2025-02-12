import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()

    const token = request.cookies?.accessToken

    if (!token) {
      throw new UnauthorizedException('No token found in cookies')
    }

    request.headers.authorization = `Bearer ${token}`

    return (super.canActivate(context) as Promise<boolean>)
  }
}
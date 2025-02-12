import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { urlencoded, json } from 'express'
import * as cookieParser from 'cookie-parser'

export const bootstrap = async () => {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  app.use(urlencoded({ extended: true, limit: '50mb' }))
  app.use(json({ limit: '50mb' }))

  app.enableCors({
    origin: ['http://localhost:3100', 'http://localhost:3332', 'http://flai.my'], // Разрешаем запросы с фронта
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })

  await app.listen(4010)
}
bootstrap()
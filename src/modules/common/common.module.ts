import { Module } from '@nestjs/common'
import { ConfigPathsService } from './config-paths.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [ConfigPathsService],
  exports: [ConfigPathsService]
})
export class CommonModule { }
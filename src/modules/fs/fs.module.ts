import { Module } from '@nestjs/common'
import { FsController } from './fs.controller'
import { FsService } from './fs.service'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [CommonModule],
  controllers: [FsController],
  providers: [FsService]
})
export class FsModule { }

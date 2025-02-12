import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { initFirebaseDb } from 'src/firebase'

@Injectable()
export class ConfigPathsService {
  private defaultFilesPath = './_tmp'

  readonly jsonFilesPath: string
  readonly trainingFilesPath: string
  readonly docsFilesPath: string

  constructor(private readonly configService: ConfigService) {
    this.jsonFilesPath = this.getConfigValue('JSON_FILES_PATH', 'jsonFiles')
    this.trainingFilesPath = this.getConfigValue('TRAINING_FILES_PATH', 'training-files')
    this.docsFilesPath = this.getConfigValue('DOCS_FILES_PATH', 'docs')
    initFirebaseDb(this.getFirebaseConfig())
  }

  private getFirebaseConfig() {
    return {
      apiKey: this.configService.get<string>('FIREBASE_API_KEY'),
      authDomain: this.configService.get<string>('FIREBASE_AUTH_DOMAIN'),
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      storageBucket: this.configService.get<string>('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.configService.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
      appId: this.configService.get<string>('FIREBASE_APP_ID'),
    }
  }

  private getConfigValue(key: string, def: string): string {
    const value = this.configService.get<string>(key)
    if (!value) {
      const path = `${this.defaultFilesPath}/${def}`
      console.warn(`${key} not defined in .env, using default: "${path}"`)
      return path
    }
    return value
  }
}
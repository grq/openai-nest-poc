import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFsAuth } from 'src/firebase'


@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  async login(user: { email: string; password: string }) {
    try {
      const userCredential = await signInWithEmailAndPassword(getFsAuth(), user.email, user.password)
      return {
        accessToken: this.jwtService.sign({
          uid: userCredential.user.uid,
          accessToken: userCredential.user.getIdToken()
        }),
      }
    } catch (error) {
      if (error.message?.startsWith('Firebase: ')) {
        throw new Error(error.message)
      }
    }
  }

  async register(user: { email: string; password: string }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(getFsAuth(), user.email, user.password)
      return { accessToken: userCredential }
    } catch (error) {
      if (error.message?.startsWith('Firebase: ')) {
        throw new Error(error.message)
      }
    }
  };
}

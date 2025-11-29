import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import env from '../../config/env'
import BaseService from '../../core/services/BaseService'

import AuthRepository from './AuthRepository'

export default class AuthService extends BaseService {
  private repo = new AuthRepository()

  private sign(id: string, role: 'USER' | 'ADMIN') {
    return jwt.sign({ role }, env.JWT_SECRET, { subject: id, expiresIn: '7d' })
  }

  async register(email: string, username: string, password: string) {
    if (await this.repo.isEmailTaken(email)) {
      const e = new Error('Email already in use') as Error & { status?: number }
      e.status = 409
      throw e
    }
    if (await this.repo.isUsernameTaken(username)) {
      const e = new Error('Username already in use') as Error & { status?: number }
      e.status = 409
      throw e
    }
    const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS)
    const user = await this.repo.createUser({ email, username, passwordHash: hash })
    const token = this.sign(user.id, user.role)
    return { token, user: this.sanitize(user) }
  }

  async login(identifier: string, password: string) {
    const user = await this.repo.findByEmailOrUsername(identifier)
    if (!user) {
      const e = new Error('Invalid credentials') as Error & { status?: number }
      e.status = 401
      throw e
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      const e = new Error('Invalid credentials') as Error & { status?: number }
      e.status = 401
      throw e
    }
    if (user.isBanned) {
      const e = new Error('User is banned') as Error & { status?: number }
      e.status = 403
      throw e
    }
    const token = this.sign(user.id, user.role)
    return { token, user: this.sanitize(user) }
  }

  async me(id: string) {
    const user = await this.repo.findById(id)
    if (!user) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    return this.sanitize(user)
  }

  async updateMe(id: string, data: { fullName?: string | null; bio?: string | null; isPrivate?: boolean }) {
    const user = await this.repo.updateMe(id, data)
    return this.sanitize(user)
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.repo.findById(id)
    if (!user) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) {
      const e = new Error('Invalid credentials') as Error & { status?: number }
      e.status = 401
      throw e
    }
    const hash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS)
    await this.repo.updatePassword(id, hash)
    return { success: true }
  }

  async setAvatar(userId: string, mediaId: string) {
    const media = await this.repo.findMediaById(mediaId)
    if (!media) {
      const e = new Error('Media not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (media.ownerId !== userId) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    const user = await this.repo.setAvatar(userId, mediaId)
    return this.sanitize(user)
  }

  async clearAvatar(userId: string) {
    const user = await this.repo.setAvatar(userId, null)
    return this.sanitize(user)
  }

  async checkUsernameAvailability(username: string) {
    const taken = await this.repo.isUsernameTaken(username)
    return { available: !taken }
  }

  async checkEmailAvailability(email: string) {
    const taken = await this.repo.isEmailTaken(email)
    return { available: !taken }
  }

  private sanitize<T extends { passwordHash: string }>(u: T) {
    const rest = { ...u } as Omit<T, 'passwordHash'> & Record<string, unknown>
    delete (rest as Record<string, unknown>).passwordHash
    return rest as Omit<T, 'passwordHash'>
  }
}
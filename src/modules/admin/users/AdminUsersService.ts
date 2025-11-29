import BaseService from '../../../core/services/BaseService'

import AdminUsersRepository from './AdminUsersRepository'

export default class AdminUsersService extends BaseService {
  private repo = new AdminUsersRepository()

  async ban(adminId: string, userId: string, reason?: string) {
    const user = await this.repo.getUser(userId)
    if (!user) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (user.isBanned) return { success: true }
    await this.repo.setBan(userId, true)
    await this.repo.logBan(userId, adminId, 'BAN', reason)
    return { success: true }
  }

  async unban(adminId: string, userId: string, reason?: string) {
    const user = await this.repo.getUser(userId)
    if (!user) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (!user.isBanned) return { success: true }
    await this.repo.setBan(userId, false)
    await this.repo.logBan(userId, adminId, 'UNBAN', reason)
    return { success: true }
  }

  async listUserBans(userId: string, skip: number, take: number) {
    return this.repo.listUserBans(userId, skip, take)
  }
}
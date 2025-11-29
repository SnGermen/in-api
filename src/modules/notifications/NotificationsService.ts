import BaseService from '../../core/services/BaseService'

import NotificationsRepository from './NotificationsRepository'

export default class NotificationsService extends BaseService {
  private repo = new NotificationsRepository()

  async notify(userId: string, actorId: string, type: 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_ACCEPTED' | 'POST_SAVED', entityType: 'POST' | 'COMMENT' | 'USER', entityId: string) {
    if (userId === actorId) return
    await this.repo.create(userId, actorId, type, entityType, entityId)
  }

  async list(userId: string, skip: number, take: number) {
    return this.repo.list(userId, skip, take)
  }

  async listSince(userId: string, since: Date, limit: number) {
    return this.repo.listSince(userId, since, limit)
  }

  async markRead(userId: string, id: string) {
    await this.repo.markRead(id, userId)
    return { success: true }
  }

  async markAllRead(userId: string) {
    await this.repo.markAllRead(userId)
    return { success: true }
  }

  async unreadCount(userId: string) {
    const count = await this.repo.unreadCount(userId)
    return { count }
  }
}
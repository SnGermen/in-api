import BaseService from '../../core/services/BaseService'
import AuthRepository from '../auth/AuthRepository'
import NotificationsService from '../notifications/NotificationsService'

import ChatsRepository from './ChatsRepository'

export default class ChatsService extends BaseService {
  private repo = new ChatsRepository()
  private users = new AuthRepository()
  private notifications = new NotificationsService()

  async startConversation(actorId: string, otherUserId: string) {
    if (actorId === otherUserId) {
      const e = new Error('Invalid target') as Error & { status?: number }
      e.status = 400
      throw e
    }
    const [a, b] = await Promise.all([this.users.findById(actorId), this.users.findById(otherUserId)])
    if (!a || !b) {
      const e = new Error('User not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (a.isBanned || b.isBanned) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    const convo = await this.repo.upsertConversation(actorId, otherUserId)
    return convo
  }

  async listConversations(userId: string, skip: number, take: number) {
    return this.repo.listConversations(userId, skip, take)
  }

  async sendMessage(conversationId: string, authorId: string, text: string) {
    if (!text || text.trim().length === 0) {
      const e = new Error('Text required') as Error & { status?: number }
      e.status = 400
      throw e
    }
    const allowed = await this.repo.isParticipant(conversationId, authorId)
    if (!allowed) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    const msg = await this.repo.createMessage(conversationId, authorId, text)
    const convo = await this.repo.findConversationById(conversationId)
    if (convo) {
      const recipient = (convo.participants as Array<{ userId: string }>).find((p) => p.userId !== authorId)?.userId
      if (recipient) {
        await this.notifications.notify(recipient, authorId, 'COMMENT', 'USER', authorId)
      }
    }
    return msg
  }

  async listMessages(conversationId: string, userId: string, skip: number, take: number) {
    const allowed = await this.repo.isParticipant(conversationId, userId)
    if (!allowed) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    return this.repo.listMessages(conversationId, skip, take)
  }
}
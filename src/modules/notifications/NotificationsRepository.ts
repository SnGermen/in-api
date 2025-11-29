import BaseRepository from '../../core/repositories/BaseRepository'

export default class NotificationsRepository extends BaseRepository {
  async create(userId: string, actorId: string, type: 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_ACCEPTED' | 'POST_SAVED', entityType: 'POST' | 'COMMENT' | 'USER', entityId: string) {
    return this.prisma.notification.create({ data: { userId, actorId, type, entityType, entityId } })
  }

  async list(userId: string, skip: number, take: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { actor: { select: this.userPublicSelect } }
    })
  }

  async listSince(userId: string, since: Date, take: number) {
    return this.prisma.notification.findMany({
      where: { userId, createdAt: { gt: since } },
      orderBy: { createdAt: 'asc' },
      take,
      include: { actor: { select: this.userPublicSelect } }
    })
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } })
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } })
  }
}
import BaseRepository from '../../../core/repositories/BaseRepository'

export default class AdminUsersRepository extends BaseRepository {
  async setBan(userId: string, isBanned: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { isBanned } })
  }

  async logBan(userId: string, adminId: string, action: 'BAN' | 'UNBAN', reason?: string) {
    return this.prisma.banLog.create({ data: { userId, adminId, action, reason } })
  }

  async getUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } })
  }

  async listUserBans(userId: string, skip: number, take: number) {
    return this.prisma.banLog.findMany({ where: { userId }, orderBy: { id: 'desc' }, skip, take, include: { admin: true } })
  }
}
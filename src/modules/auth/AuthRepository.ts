import BaseRepository from '../../core/repositories/BaseRepository'

export default class AuthRepository extends BaseRepository {
  async findByEmailOrUsername(identifier: string) {
    return this.prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } })
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async createUser(data: { email: string; username: string; passwordHash: string }) {
    return this.prisma.user.create({ data })
  }

  async isEmailTaken(email: string) {
    const u = await this.prisma.user.findUnique({ where: { email } })
    return Boolean(u)
  }

  async isUsernameTaken(username: string) {
    const u = await this.prisma.user.findUnique({ where: { username } })
    return Boolean(u)
  }

  async updateMe(id: string, data: { fullName?: string | null; bio?: string | null; isPrivate?: boolean }) {
    return this.prisma.user.update({ where: { id }, data })
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } })
  }

  async setAvatar(userId: string, mediaId: string | null) {
    return this.prisma.user.update({ where: { id: userId }, data: { avatarMediaId: mediaId } })
  }

  async findMediaById(id: string) {
    return this.prisma.media.findUnique({ where: { id } })
  }
}

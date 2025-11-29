import { Prisma } from '@prisma/client'

import BaseRepository from '../../core/repositories/BaseRepository'

export default class UsersRepository extends BaseRepository {
  async getPublicUser(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.userPublicSelect
    })
  }

  async postsCount(userId: string) {
    return this.prisma.post.count({ where: { authorId: userId, deletedAt: null } })
  }

  async followersCount(userId: string) {
    return this.prisma.follow.count({ where: { followingId: userId, status: 'APPROVED' } as Prisma.FollowWhereInput })
  }

  async followingCount(userId: string) {
    return this.prisma.follow.count({ where: { followerId: userId, status: 'APPROVED' } as Prisma.FollowWhereInput })
  }

  async isApprovedFollower(viewerId: string, userId: string) {
    const rel = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: userId } } })
    return Boolean(rel && rel.status === 'APPROVED')
  }
}
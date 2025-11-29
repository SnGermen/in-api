import BaseRepository from '../../core/repositories/BaseRepository'

export default class FollowsRepository extends BaseRepository {
  async upsertFollow(followerId: string, followingId: string, status: 'APPROVED' | 'PENDING') {
    return this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId, status },
      update: { status }
    })
  }

  async removeFollow(followerId: string, followingId: string) {
    return this.prisma.follow.deleteMany({ where: { followerId, followingId } })
  }

  async getFollow(followerId: string, followingId: string) {
    return this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } })
  }

  async listFollowers(userId: string, skip: number, take: number) {
    const rows = await this.prisma.follow.findMany({
      where: { followingId: userId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { follower: { select: this.userPublicSelect } }
    })
    return rows.map((r) => r.follower)
  }

  async listFollowing(userId: string, skip: number, take: number) {
    const rows = await this.prisma.follow.findMany({
      where: { followerId: userId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { following: { select: this.userPublicSelect } }
    })
    return rows.map((r) => r.following)
  }

  async listIncomingRequests(userId: string, skip: number, take: number) {
    return this.prisma.follow.findMany({
      where: { followingId: userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { follower: { select: this.userPublicSelect } }
    })
  }

  async approveRequest(id: string) {
    return this.prisma.follow.update({ where: { id }, data: { status: 'APPROVED' } })
  }

  async getById(id: string) {
    return this.prisma.follow.findUnique({ where: { id } })
  }

  async deleteById(id: string) {
    return this.prisma.follow.delete({ where: { id } })
  }

  async listOutgoingRequests(userId: string, skip: number, take: number) {
    return this.prisma.follow.findMany({
      where: { followerId: userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { following: { select: this.userPublicSelect } }
    })
  }

  async listMutuals(userId: string, skip: number, take: number) {
    const following = await this.prisma.follow.findMany({ where: { followerId: userId, status: 'APPROVED' }, select: { followingId: true } })
    const followers = await this.prisma.follow.findMany({ where: { followingId: userId, status: 'APPROVED' }, select: { followerId: true } })
    const setFollowings = new Set(following.map((r) => r.followingId))
    const mutualIds = followers.map((r) => r.followerId).filter((id) => setFollowings.has(id))
    if (mutualIds.length === 0) return []
    return this.prisma.user.findMany({ where: { id: { in: mutualIds } }, orderBy: { createdAt: 'desc' }, skip, take, select: this.userPublicSelect })
  }
}

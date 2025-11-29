import BaseRepository from '../../core/repositories/BaseRepository'

export default class FeedRepository extends BaseRepository {
  async listForUser(userId: string, skip: number, take: number, orderBy: Record<string, 'asc' | 'desc'>) {
    return this.prisma.post.findMany({
      where: {
        deletedAt: null,
        OR: [
          { authorId: userId },
          { author: { isPrivate: false } },
          { author: { followsAsFollowing: { some: { followerId: userId, status: 'APPROVED' } } } }
        ]
      },
      skip,
      take,
      orderBy,
      include: {
        author: { select: this.userPublicSelect },
        media: { include: { media: true }, orderBy: { order: 'asc' } },
        _count: { select: { likes: true, comments: true, saves: true } }
      }
    })
  }
}

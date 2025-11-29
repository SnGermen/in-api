import BaseRepository from '../../core/repositories/BaseRepository'

export default class SavesRepository extends BaseRepository {
  async savedPostExists(postId: string, userId: string) {
    return this.prisma.savedPost.findUnique({ where: { postId_userId: { postId, userId } } })
  }
  async savePost(postId: string, userId: string) {
    return this.prisma.savedPost.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {}
    })
  }

  async unsavePost(postId: string, userId: string) {
    return this.prisma.savedPost.deleteMany({ where: { postId, userId } })
  }

  async listSavedPostsAccessible(userId: string, skip: number, take: number, orderBy: Record<string, 'asc' | 'desc'>) {
    return this.prisma.post.findMany({
      where: {
        deletedAt: null,
        saves: { some: { userId } },
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
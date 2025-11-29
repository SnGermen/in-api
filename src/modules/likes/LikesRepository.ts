import BaseRepository from '../../core/repositories/BaseRepository'

export default class LikesRepository extends BaseRepository {
  async postLikeExists(postId: string, userId: string) {
    return this.prisma.postLike.findUnique({ where: { postId_userId: { postId, userId } } })
  }
  async likePost(postId: string, userId: string) {
    return this.prisma.postLike.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {}
    })
  }

  async unlikePost(postId: string, userId: string) {
    return this.prisma.postLike.deleteMany({ where: { postId, userId } })
  }

  async listPostLikes(postId: string, skip: number, take: number) {
    const likes = await this.prisma.postLike.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { user: true }
    })
    return likes.map((l) => l.user)
  }

  async commentLikeExists(commentId: string, userId: string) {
    return this.prisma.commentLike.findUnique({ where: { commentId_userId: { commentId, userId } } })
  }

  async likeComment(commentId: string, userId: string) {
    return this.prisma.commentLike.upsert({
      where: { commentId_userId: { commentId, userId } },
      create: { commentId, userId },
      update: {}
    })
  }

  async unlikeComment(commentId: string, userId: string) {
    return this.prisma.commentLike.deleteMany({ where: { commentId, userId } })
  }

  async listCommentLikes(commentId: string, skip: number, take: number) {
    const likes = await this.prisma.commentLike.findMany({
      where: { commentId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { user: true }
    })
    return likes.map((l) => l.user)
  }
}
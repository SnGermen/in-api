import BaseRepository from '../../core/repositories/BaseRepository'

export default class StoriesRepository extends BaseRepository {
  async create(authorId: string, expiresAt: Date) {
    return this.prisma.story.create({ data: { authorId, expiresAt } })
  }

  async attachMedia(storyId: string, mediaIds: string[]) {
    if (mediaIds.length === 0) return []
    const data = mediaIds.map((mid) => ({ storyId, mediaId: mid }))
    return this.prisma.storyMedia.createMany({ data })
  }

  async findById(id: string) {
    return this.prisma.story.findUnique({
      where: { id },
      include: { author: { select: this.userPublicSelect }, media: { include: { media: true } } }
    })
  }

  async getMediasByIds(ids: string[]) {
    return this.prisma.media.findMany({ where: { id: { in: ids } } })
  }

  async listActiveAccessible(userId: string, now: Date, skip: number, take: number) {
    return this.prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
        OR: [
          { authorId: userId },
          { author: { isPrivate: false } },
          { author: { followsAsFollowing: { some: { followerId: userId, status: 'APPROVED' } } } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { author: { select: this.userPublicSelect }, media: { include: { media: true } } }
    })
  }

  async listActiveForUser(authorId: string, now: Date, skip: number, take: number) {
    return this.prisma.story.findMany({
      where: { authorId, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { author: { select: this.userPublicSelect }, media: { include: { media: true } } }
    })
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async delete(authorId: string, id: string) {
    return this.prisma.story.deleteMany({ where: { id, authorId } })
  }
}
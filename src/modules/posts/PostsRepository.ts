import { Prisma } from '@prisma/client'

import BaseRepository from '../../core/repositories/BaseRepository'

export default class PostsRepository extends BaseRepository {
  async createPost(authorId: string, caption?: string | null, location?: string | null) {
    return this.prisma.post.create({ data: { authorId, caption: caption ?? null, location: location ?? null } })
  }

  async attachMedia(postId: string, mediaIds: string[]) {
    if (mediaIds.length === 0) return []
    const data = mediaIds.map((mid, idx) => ({ postId, mediaId: mid, order: idx }))
    return this.prisma.postMedia.createMany({ data })
  }

  async findById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: this.userPublicSelect },
        media: { include: { media: true }, orderBy: { order: 'asc' } },
        _count: { select: { likes: true, comments: true, saves: true } }
      }
    })
  }

  async updateCaption(id: string, caption?: string | null) {
    return this.prisma.post.update({ where: { id }, data: { caption: caption ?? null } })
  }

  async softDelete(id: string) {
    return this.prisma.post.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async restore(id: string) {
    return this.prisma.post.update({ where: { id }, data: { deletedAt: null } })
  }

  async list(params: {
    authorId?: string
    from?: Date
    to?: Date
    skip: number
    take: number
    orderBy: Record<string, 'asc' | 'desc'>
  }) {
    const where: Record<string, unknown> = { deletedAt: null }
    if (params.authorId) where['authorId'] = params.authorId
    if (params.from || params.to) where['createdAt'] = {
      gte: params.from,
      lte: params.to
    }
    return this.prisma.post.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: {
        author: { select: this.userPublicSelect },
        media: { include: { media: true }, orderBy: { order: 'asc' } },
        _count: { select: { likes: true, comments: true, saves: true } }
      }
    })
  }

  async listAccessibleForUser(userId: string | undefined, params: {
    authorId?: string
    from?: Date
    to?: Date
    skip: number
    take: number
    orderBy: Record<string, 'asc' | 'desc'>
  }) {
    const dateRange: Prisma.PostWhereInput = params.from || params.to ? { createdAt: { gte: params.from, lte: params.to } } : {}
    const authorFilter: Prisma.PostWhereInput = params.authorId ? { authorId: params.authorId } : {}
    const accessibility: Prisma.PostWhereInput = userId
      ? {
          OR: [
            { authorId: userId },
            { author: { is: { isPrivate: false } } },
            { author: { is: { followsAsFollowing: { some: { followerId: userId, status: 'APPROVED' } } } } }
          ]
        }
      : { author: { is: { isPrivate: false } } }
    const where: Prisma.PostWhereInput = { deletedAt: null, ...dateRange, ...authorFilter, ...accessibility }
    return this.prisma.post.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: {
        author: { select: this.userPublicSelect },
        media: { include: { media: true }, orderBy: { order: 'asc' } },
        _count: { select: { likes: true, comments: true, saves: true } }
      }
    })
  }

  async getMediasByIds(ids: string[]) {
    return this.prisma.media.findMany({ where: { id: { in: ids } } })
  }
}
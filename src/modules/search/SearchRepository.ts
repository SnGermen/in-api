import { Prisma } from '@prisma/client'

import BaseRepository from '../../core/repositories/BaseRepository'

export default class SearchRepository extends BaseRepository {
  async searchUsers(q: string, skip: number, take: number) {
    const where: Prisma.UserWhereInput = q
      ? {
          isBanned: false,
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { fullName: { contains: q, mode: 'insensitive' } }
          ]
        }
      : { isBanned: false }
    return this.prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, select: this.userPublicSelect })
  }

  async searchPublicPosts(q: string, skip: number, take: number) {
    const where: any = { deletedAt: null, author: { isPrivate: false } }
    if (q) {
      where.OR = [
        { caption: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } }
      ]
    }
    return this.prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: this.userPublicSelect },
        media: { include: { media: true }, orderBy: { order: 'asc' } },
        _count: { select: { likes: true, comments: true, saves: true } }
      }
    })
  }

  async searchAccessiblePosts(q: string, userId: string, skip: number, take: number) {
    const base: any = { deletedAt: null }
    const text = q
      ? {
          OR: [
            { caption: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {}
    return this.prisma.post.findMany({
      where: {
        ...base,
        ...text,
        OR: [
          { authorId: userId },
          { author: { isPrivate: false } },
          { author: { followsAsFollowing: { some: { followerId: userId, status: 'APPROVED' } } } }
        ]
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: this.userPublicSelect },
        media: { include: { media: true }, orderBy: { order: 'asc' } },
        _count: { select: { likes: true, comments: true, saves: true } }
      }
    })
  }
}
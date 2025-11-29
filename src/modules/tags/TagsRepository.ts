import BaseRepository from '../../core/repositories/BaseRepository'

export default class TagsRepository extends BaseRepository {
  async upsertTag(name: string) {
    const prismaAny = this.prisma as any
    return prismaAny.tag.upsert({ where: { name }, create: { name }, update: {} })
  }

  async setPostTags(postId: string, tagNames: string[]) {
    const prismaAny = this.prisma as any
    await prismaAny.postTag.deleteMany({ where: { postId } })
    if (tagNames.length === 0) return
    const tags = await Promise.all(tagNames.map((n) => this.upsertTag(n)))
    await prismaAny.postTag.createMany({ data: tags.map((t: any) => ({ postId, tagId: t.id })) })
  }

  async listPostsByTagAccessible(tagName: string, userId?: string, skip?: number, take?: number) {
    const prismaAny = this.prisma as any
    return prismaAny.post.findMany({
      where: {
        deletedAt: null,
        tags: { some: { tag: { name: tagName } } },
        OR: userId
          ? [
              { authorId: userId },
              { author: { isPrivate: false } },
              { author: { followsAsFollowing: { some: { followerId: userId, status: 'APPROVED' } } } }
            ]
          : [{ author: { isPrivate: false } }]
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { author: { select: this.userPublicSelect }, media: { include: { media: true } }, _count: { select: { likes: true, comments: true, saves: true } } }
    })
  }

  async trending(limit: number) {
    const prismaAny = this.prisma as any
    const rows = await prismaAny.postTag.groupBy({ by: ['tagId'], _count: { tagId: true }, orderBy: { _count: { tagId: 'desc' } }, take: limit })
    const tags = await prismaAny.tag.findMany({ where: { id: { in: rows.map((r: any) => r.tagId) } } })
    const countMap = new Map(rows.map((r: any) => [r.tagId, r._count.tagId]))
    return tags.map((t: any) => ({ name: t.name, count: countMap.get(t.id) || 0 }))
  }
}
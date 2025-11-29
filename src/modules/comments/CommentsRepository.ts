import BaseRepository from '../../core/repositories/BaseRepository'

export default class CommentsRepository extends BaseRepository {
  async create(postId: string, authorId: string, text: string, parentId?: string) {
    return this.prisma.comment.create({ data: { postId, authorId, text, parentId: parentId ?? null } })
  }

  async findById(id: string) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: { author: { select: this.userPublicSelect }, post: true, _count: { select: { likes: true } } }
    })
  }

  async updateText(id: string, text: string) {
    return this.prisma.comment.update({ where: { id }, data: { text } })
  }

  async softDelete(id: string) {
    return this.prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } })
  }

  async restore(id: string) {
    return this.prisma.comment.update({ where: { id }, data: { deletedAt: null } })
  }

  async listForPost(postId: string, skip: number, take: number) {
    return this.prisma.comment.findMany({
      where: { postId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
      include: { author: { select: this.userPublicSelect }, _count: { select: { likes: true } } }
    })
  }
}
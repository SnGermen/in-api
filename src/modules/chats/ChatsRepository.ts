import BaseRepository from '../../core/repositories/BaseRepository'

export default class ChatsRepository extends BaseRepository {
  async upsertConversation(aId: string, bId: string) {
    const ids = aId < bId ? [aId, bId] : [bId, aId]
    const prismaAny = this.prisma as any
    let convo = await prismaAny.conversation.findUnique({ where: { keyA_keyB: { keyA: ids[0], keyB: ids[1] } } })
    if (!convo) {
      convo = await prismaAny.conversation.create({ data: { keyA: ids[0], keyB: ids[1] } })
      await prismaAny.conversationParticipant.createMany({ data: [
        { conversationId: convo.id, userId: aId },
        { conversationId: convo.id, userId: bId }
      ] })
    }
    return convo
  }

  async listConversations(userId: string, skip: number, take: number) {
    const prismaAny = this.prisma as any
    return prismaAny.conversation.findMany({
      where: { participants: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      include: { participants: { include: { user: { select: this.userPublicSelect } } }, lastMessage: true }
    })
  }

  async createMessage(conversationId: string, authorId: string, text: string) {
    const prismaAny = this.prisma as any
    return prismaAny.message.create({ data: { conversationId, authorId, text } })
  }

  async listMessages(conversationId: string, skip: number, take: number) {
    const prismaAny = this.prisma as any
    return prismaAny.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
      include: { author: { select: this.userPublicSelect } }
    })
  }

  async isParticipant(conversationId: string, userId: string) {
    const prismaAny = this.prisma as any
    const p = await prismaAny.conversationParticipant.findFirst({ where: { conversationId, userId } })
    return Boolean(p)
  }

  async findConversationById(id: string) {
    const prismaAny = this.prisma as any
    return prismaAny.conversation.findUnique({ where: { id }, include: { participants: true } })
  }
}
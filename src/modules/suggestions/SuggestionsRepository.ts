import BaseRepository from '../../core/repositories/BaseRepository'

export default class SuggestionsRepository extends BaseRepository {
  async listUserSuggestions(currentUserId: string, skip: number, take: number) {
    return this.prisma.user.findMany({
      where: {
        isBanned: false,
        id: { not: currentUserId },
        NOT: { followsAsFollowing: { some: { followerId: currentUserId } } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    })
  }
}
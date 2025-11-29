import BaseRepository from '../../core/repositories/BaseRepository'

export default class MediaRepository extends BaseRepository {
  async create(ownerId: string, pathRel: string, width?: number | null, height?: number | null) {
    return this.prisma.media.create({ data: { ownerId, type: 'IMAGE', path: pathRel, width: width ?? null, height: height ?? null } })
  }

  async findById(id: string) {
    return this.prisma.media.findUnique({ where: { id } })
  }

  async delete(id: string) {
    return this.prisma.media.delete({ where: { id } })
  }

  async usageCounts(id: string) {
    const [postMedia, storyMedia, avatarUsers] = await Promise.all([
      this.prisma.postMedia.count({ where: { mediaId: id } }),
      this.prisma.storyMedia.count({ where: { mediaId: id } }),
      this.prisma.user.count({ where: { avatarMediaId: id } })
    ])
    return { postMedia, storyMedia, avatarUsers }
  }
}

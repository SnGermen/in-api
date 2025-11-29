import BaseRepository from '../../core/repositories/BaseRepository'

export default class ReportsRepository extends BaseRepository {
  async create(reporterId: string, targetType: 'POST' | 'COMMENT' | 'USER', targetId: string, reason: string) {
    return this.prisma.report.create({ data: { reporterId, targetType, targetId, reason, status: 'OPEN' } })
  }

  async listMine(reporterId: string, skip: number, take: number) {
    return this.prisma.report.findMany({ where: { reporterId }, orderBy: { createdAt: 'desc' }, skip, take })
  }

  async findById(id: string) {
    return this.prisma.report.findUnique({ where: { id } })
  }

  async listAdmin(skip: number, take: number, status?: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED') {
    return this.prisma.report.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      skip,
      take
    })
  }

  async updateStatus(id: string, status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED') {
    return this.prisma.report.update({ where: { id }, data: { status } })
  }
}
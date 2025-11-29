import BaseService from '../../core/services/BaseService'

import FeedRepository from './FeedRepository'

export default class FeedService extends BaseService {
  private repo = new FeedRepository()

  async list(userId: string, skip: number, take: number, orderBy: Record<string, 'asc' | 'desc'>) {
    return this.repo.listForUser(userId, skip, take, orderBy)
  }
}
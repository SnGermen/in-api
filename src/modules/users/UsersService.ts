import BaseService from '../../core/services/BaseService'

import UsersRepository from './UsersRepository'

export default class UsersService extends BaseService {
  private repo = new UsersRepository()

  async getProfile(id: string, viewerId?: string) {
    const user = await this.repo.getPublicUser(id)
    if (!user) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    const posts = await this.repo.postsCount(id)
    const followers = await this.repo.followersCount(id)
    const following = await this.repo.followingCount(id)
    const canViewPrivate = !user.isPrivate || viewerId === id || (viewerId ? await this.repo.isApprovedFollower(viewerId, id) : false)
    return { user, stats: { posts, followers, following }, canViewPrivate }
  }
}
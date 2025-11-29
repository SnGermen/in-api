import BaseService from '../../core/services/BaseService'

import SearchRepository from './SearchRepository'

export default class SearchService extends BaseService {
  private repo = new SearchRepository()

  async users(q: string | undefined, skip: number, take: number) {
    return this.repo.searchUsers(q ?? '', skip, take)
  }

  async postsPublic(q: string | undefined, skip: number, take: number) {
    return this.repo.searchPublicPosts(q ?? '', skip, take)
  }

  async postsAccessible(q: string | undefined, userId: string, skip: number, take: number) {
    return this.repo.searchAccessiblePosts(q ?? '', userId, skip, take)
  }
}
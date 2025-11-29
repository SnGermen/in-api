import BaseService from '../../core/services/BaseService'

import SuggestionsRepository from './SuggestionsRepository'

export default class SuggestionsService extends BaseService {
  private repo = new SuggestionsRepository()

  async users(currentUserId: string, skip: number, take: number) {
    return this.repo.listUserSuggestions(currentUserId, skip, take)
  }
}
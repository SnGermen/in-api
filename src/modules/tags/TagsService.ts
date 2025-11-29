import BaseService from '../../core/services/BaseService'

import TagsRepository from './TagsRepository'

export default class TagsService extends BaseService {
  private repo = new TagsRepository()

  extractNames(text?: string | null) {
    if (!text) return []
    const set = new Set<string>()
    const re = /#([\p{L}\p{N}_]+)/gu
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) != null) set.add(m[1].toLowerCase())
    return Array.from(set)
  }

  async setPostTagsFromCaption(postId: string, caption?: string | null) {
    const names = this.extractNames(caption)
    await this.repo.setPostTags(postId, names)
  }

  async postsByTag(tag: string, viewerId?: string, skip?: number, take?: number) {
    return this.repo.listPostsByTagAccessible(tag.toLowerCase(), viewerId, skip, take)
  }

  async trending(limit: number) {
    return this.repo.trending(limit)
  }
}
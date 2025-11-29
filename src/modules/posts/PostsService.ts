import BaseService from '../../core/services/BaseService'
import TagsService from '../tags/TagsService'

import PostsRepository from './PostsRepository'

export default class PostsService extends BaseService {
  private repo = new PostsRepository()
  private tags = new TagsService()

  async create(authorId: string, caption: string | undefined, mediaIds: string[] = []) {
    if (mediaIds.length > 0) {
      const medias = await this.repo.getMediasByIds(mediaIds)
      const allOwned = medias.every((m) => m.ownerId === authorId)
      if (!allOwned || medias.length !== mediaIds.length) {
        const e = new Error('Invalid media ownership') as Error & { status?: number }
        e.status = 400
        throw e
      }
    }
    const post = await this.repo.createPost(authorId, caption ?? null, null)
    await this.repo.attachMedia(post.id, mediaIds)
    await this.tags.setPostTagsFromCaption(post.id, caption ?? null)
    return this.repo.findById(post.id)
  }

  async get(id: string) {
    const post = await this.repo.findById(id)
    if (!post || post.deletedAt) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    return post
  }

  async update(authorId: string, id: string, caption?: string | null) {
    const post = await this.repo.findById(id)
    if (!post || post.deletedAt) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (post.authorId !== authorId) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    await this.repo.updateCaption(id, caption ?? null)
    await this.tags.setPostTagsFromCaption(id, caption ?? null)
    return this.repo.findById(id)
  }

  async remove(authorId: string, id: string) {
    const post = await this.repo.findById(id)
    if (!post || post.deletedAt) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (post.authorId !== authorId) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    await this.repo.softDelete(id)
    return { success: true }
  }

  async list(query: { authorId?: string; from?: Date; to?: Date; skip: number; take: number; orderBy: Record<string, 'asc' | 'desc'> }) {
    return this.repo.listAccessibleForUser(undefined, query)
  }

  async listForUser(userId: string, query: { authorId?: string; from?: Date; to?: Date; skip: number; take: number; orderBy: Record<string, 'asc' | 'desc'> }) {
    return this.repo.listAccessibleForUser(userId, query)
  }
}
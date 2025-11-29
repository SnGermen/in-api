import BaseService from '../../core/services/BaseService'
import FollowsRepository from '../follows/FollowsRepository'

import StoriesRepository from './StoriesRepository'

export default class StoriesService extends BaseService {
  private repo = new StoriesRepository()
  private follows = new FollowsRepository()

  async create(authorId: string, mediaIds: string[], expiresInHours = 24) {
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      const e = new Error('MediaIds required') as Error & { status?: number }
      e.status = 400
      throw e
    }
    const medias = await this.repo.getMediasByIds(mediaIds)
    const allOwned = medias.every((m) => m.ownerId === authorId)
    if (!allOwned || medias.length !== mediaIds.length) {
      const e = new Error('Invalid media ownership') as Error & { status?: number }
      e.status = 400
      throw e
    }
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000)
    const story = await this.repo.create(authorId, expiresAt)
    await this.repo.attachMedia(story.id, mediaIds)
    return this.repo.findById(story.id)
  }

  async listAccessible(userId: string, skip: number, take: number) {
    const now = new Date()
    return this.repo.listActiveAccessible(userId, now, skip, take)
  }

  async listForUser(requesterId: string, authorId: string, skip: number, take: number) {
    if (requesterId !== authorId) {
      const rel = await this.follows.getFollow(requesterId, authorId)
      const allowed = Boolean(rel?.status === 'APPROVED')
      const isPublic = (await this.repo.findUserById(authorId))?.isPrivate === false
      if (!allowed && !isPublic) {
        const e = new Error('Forbidden') as Error & { status?: number }
        e.status = 403
        throw e
      }
    }
    const now = new Date()
    return this.repo.listActiveForUser(authorId, now, skip, take)
  }

  async remove(authorId: string, id: string) {
    const del = await this.repo.delete(authorId, id)
    if (del.count === 0) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    return { success: true }
  }
}
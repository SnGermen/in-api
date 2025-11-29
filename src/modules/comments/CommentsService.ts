import BaseService from '../../core/services/BaseService'
import PostsRepository from '../posts/PostsRepository'
import NotificationsService from '../notifications/NotificationsService'

import CommentsRepository from './CommentsRepository'

export default class CommentsService extends BaseService {
  private repo = new CommentsRepository()
  private posts = new PostsRepository()
  private notifications = new NotificationsService()

  async addToPost(postId: string, authorId: string, text: string, parentId?: string) {
    const post = await this.posts.findById(postId)
    if (!post || post.deletedAt) {
      const e = new Error('Post not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (parentId) {
      const parent = await this.repo.findById(parentId)
      if (!parent || parent.postId !== postId || parent.deletedAt) {
        const e = new Error('Invalid parent comment') as Error & { status?: number }
        e.status = 400
        throw e
      }
    }
    const c = await this.repo.create(postId, authorId, text, parentId)
    if (post.authorId !== authorId) {
      await this.notifications.notify(post.authorId, authorId, 'COMMENT', 'POST', postId)
    }
    return this.repo.findById(c.id)
  }

  async list(postId: string, skip: number, take: number) {
    const post = await this.posts.findById(postId)
    if (!post || post.deletedAt) {
      const e = new Error('Post not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    return this.repo.listForPost(postId, skip, take)
  }

  async update(authorId: string, id: string, text: string) {
    const c = await this.repo.findById(id)
    if (!c || c.deletedAt) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (c.authorId !== authorId) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    await this.repo.updateText(id, text)
    return this.repo.findById(id)
  }

  async remove(authorId: string, id: string) {
    const c = await this.repo.findById(id)
    if (!c || c.deletedAt) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (c.authorId !== authorId) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    await this.repo.softDelete(id)
    return { success: true }
  }
}
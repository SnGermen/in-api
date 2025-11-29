import BaseService from '../../core/services/BaseService'
import PostsRepository from '../posts/PostsRepository'
import FollowsRepository from '../follows/FollowsRepository'
import NotificationsService from '../notifications/NotificationsService'

import SavesRepository from './SavesRepository'

export default class SavesService extends BaseService {
  private repo = new SavesRepository()
  private posts = new PostsRepository()
  private follows = new FollowsRepository()
  private notifications = new NotificationsService()

  async save(postId: string, userId: string) {
    const post = await this.posts.findById(postId)
    if (!post || post.deletedAt) {
      const e = new Error('Post not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    const author = post.author
    let allowed = false
    if (author.id === userId) allowed = true
    else if (!author.isPrivate) allowed = true
    else {
      const rel = await this.follows.getFollow(userId, author.id)
      allowed = Boolean(rel && rel.status === 'APPROVED')
    }
    if (!allowed) {
      const e = new Error('Not allowed') as Error & { status?: number }
      e.status = 403
      throw e
    }
    const existed = await this.repo.savedPostExists(postId, userId)
    await this.repo.savePost(postId, userId)
    if (!existed) {
      await this.notifications.notify(author.id, userId, 'POST_SAVED', 'POST', postId)
    }
    return { success: true }
  }

  async unsave(postId: string, userId: string) {
    await this.repo.unsavePost(postId, userId)
    return { success: true }
  }

  async list(userId: string, skip: number, take: number, orderBy: Record<string, 'asc' | 'desc'>) {
    return this.repo.listSavedPostsAccessible(userId, skip, take, orderBy)
  }
}

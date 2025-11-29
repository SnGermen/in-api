import BaseService from '../../../core/services/BaseService'
import PostsRepository from '../../posts/PostsRepository'
import CommentsRepository from '../../comments/CommentsRepository'

export default class AdminContentService extends BaseService {
  private posts = new PostsRepository()
  private comments = new CommentsRepository()

  async hidePost(id: string) {
    const post = await this.posts.findById(id)
    if (!post) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    await this.posts.softDelete(id)
    return { success: true }
  }

  async restorePost(id: string) {
    const post = await this.posts.findById(id)
    if (!post) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    await this.posts.restore(id)
    return { success: true }
  }

  async hideComment(id: string) {
    const comment = await this.comments.findById(id)
    if (!comment) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    await this.comments.softDelete(id)
    return { success: true }
  }

  async restoreComment(id: string) {
    const comment = await this.comments.findById(id)
    if (!comment) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    await this.comments.restore(id)
    return { success: true }
  }
}
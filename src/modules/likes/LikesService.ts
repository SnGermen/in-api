import BaseService from '../../core/services/BaseService'
import PostsRepository from '../posts/PostsRepository'
import CommentsRepository from '../comments/CommentsRepository'
import NotificationsService from '../notifications/NotificationsService'

import LikesRepository from './LikesRepository'

export default class LikesService extends BaseService {
  private repo = new LikesRepository()
  private posts = new PostsRepository()
  private comments = new CommentsRepository()
  private notifications = new NotificationsService()

  async likePost(postId: string, userId: string) {
    const post = await this.posts.findById(postId)
    if (!post || post.deletedAt) {
      const e = new Error('Post not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    const existed = await this.repo.postLikeExists(postId, userId)
    await this.repo.likePost(postId, userId)
    if (!existed) {
      await this.notifications.notify(post.authorId, userId, 'LIKE_POST', 'POST', postId)
    }
    return { success: true }
  }

  async unlikePost(postId: string, userId: string) {
    const post = await this.posts.findById(postId)
    if (!post || post.deletedAt) {
      const e = new Error('Post not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    await this.repo.unlikePost(postId, userId)
    return { success: true }
  }

  async listPostLikes(postId: string, skip: number, take: number) {
    const post = await this.posts.findById(postId)
    if (!post || post.deletedAt) {
      const e = new Error('Post not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    return this.repo.listPostLikes(postId, skip, take)
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.comments.findById(commentId)
    if (!comment || comment.deletedAt) {
      const e = new Error('Comment not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    const existed = await this.repo.commentLikeExists(commentId, userId)
    await this.repo.likeComment(commentId, userId)
    if (!existed) {
      await this.notifications.notify(comment.authorId, userId, 'LIKE_COMMENT', 'COMMENT', commentId)
    }
    return { success: true }
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.comments.findById(commentId)
    if (!comment || comment.deletedAt) {
      const e = new Error('Comment not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    await this.repo.unlikeComment(commentId, userId)
    return { success: true }
  }

  async listCommentLikes(commentId: string, skip: number, take: number) {
    const comment = await this.comments.findById(commentId)
    if (!comment || comment.deletedAt) {
      const e = new Error('Comment not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    return this.repo.listCommentLikes(commentId, skip, take)
  }
}
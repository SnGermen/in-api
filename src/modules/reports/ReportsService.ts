import BaseService from '../../core/services/BaseService'
import PostsRepository from '../posts/PostsRepository'
import CommentsRepository from '../comments/CommentsRepository'
import AuthRepository from '../auth/AuthRepository'

import ReportsRepository from './ReportsRepository'

export default class ReportsService extends BaseService {
  private repo = new ReportsRepository()
  private posts = new PostsRepository()
  private comments = new CommentsRepository()
  private users = new AuthRepository()

  async create(reporterId: string, targetType: 'POST' | 'COMMENT' | 'USER', targetId: string, reason: string) {
    if (!reason || reason.trim().length === 0) {
      const e = new Error('Reason required') as Error & { status?: number }
      e.status = 400
      throw e
    }
    if (targetType === 'USER') {
      if (targetId === reporterId) {
        const e = new Error('Cannot report yourself') as Error & { status?: number }
        e.status = 400
        throw e
      }
      const u = await this.users.findById(targetId)
      if (!u) {
        const e = new Error('User not found') as Error & { status?: number }
        e.status = 404
        throw e
      }
    } else if (targetType === 'POST') {
      const p = await this.posts.findById(targetId)
      if (!p || p.deletedAt) {
        const e = new Error('Post not found') as Error & { status?: number }
        e.status = 404
        throw e
      }
    } else if (targetType === 'COMMENT') {
      const c = await this.comments.findById(targetId)
      if (!c || c.deletedAt) {
        const e = new Error('Comment not found') as Error & { status?: number }
        e.status = 404
        throw e
      }
    }
    const r = await this.repo.create(reporterId, targetType, targetId, reason)
    return r
  }

  async listMine(reporterId: string, skip: number, take: number) {
    return this.repo.listMine(reporterId, skip, take)
  }

  async adminList(status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED' | undefined, skip: number, take: number) {
    return this.repo.listAdmin(skip, take, status)
  }

  async adminUpdateStatus(id: string, status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED') {
    const r = await this.repo.findById(id)
    if (!r) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    await this.repo.updateStatus(id, status)
    return { success: true }
  }
}
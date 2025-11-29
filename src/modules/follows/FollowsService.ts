import BaseService from '../../core/services/BaseService'
import AuthRepository from '../auth/AuthRepository'
import NotificationsService from '../notifications/NotificationsService'

import FollowsRepository from './FollowsRepository'

export default class FollowsService extends BaseService {
  private repo = new FollowsRepository()
  private users = new AuthRepository()
  private notifications = new NotificationsService()

  async follow(actorId: string, targetId: string) {
    if (actorId === targetId) {
      const e = new Error('Cannot follow yourself') as Error & { status?: number }
      e.status = 400
      throw e
    }
    const actor = await this.users.findById(actorId)
    const target = await this.users.findById(targetId)
    if (!actor || !target) {
      const e = new Error('User not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (actor.isBanned || target.isBanned) {
      const e = new Error('User is banned') as Error & { status?: number }
      e.status = 403
      throw e
    }
    const existing = await this.repo.getFollow(actorId, targetId)
    if (existing) return { success: true, status: existing.status }
    const status: 'APPROVED' | 'PENDING' = target.isPrivate ? 'PENDING' : 'APPROVED'
    await this.repo.upsertFollow(actorId, targetId, status)
    if (status === 'APPROVED') {
      await this.notifications.notify(targetId, actorId, 'FOLLOW', 'USER', targetId)
    }
    return { success: true, status }
  }

  async unfollow(actorId: string, targetId: string) {
    await this.repo.removeFollow(actorId, targetId)
    return { success: true }
  }

  async incomingRequests(currentUserId: string, skip: number, take: number) {
    const items = await this.repo.listIncomingRequests(currentUserId, skip, take)
    return items
  }

  async outgoingRequests(currentUserId: string, skip: number, take: number) {
    const items = await this.repo.listOutgoingRequests(currentUserId, skip, take)
    return items
  }

  async approve(currentUserId: string, requestId: string) {
    const row = await this.repo.getById(requestId)
    if (!row || row.followingId !== currentUserId || row.status !== 'PENDING') {
      const e = new Error('Invalid request') as Error & { status?: number }
      e.status = 400
      throw e
    }
    await this.repo.approveRequest(requestId)
    await this.notifications.notify(row.followerId, currentUserId, 'FOLLOW_ACCEPTED', 'USER', currentUserId)
    return { success: true }
  }

  async reject(currentUserId: string, requestId: string) {
    const row = await this.repo.getById(requestId)
    if (!row || row.followingId !== currentUserId || row.status !== 'PENDING') {
      const e = new Error('Invalid request') as Error & { status?: number }
      e.status = 400
      throw e
    }
    await this.repo.deleteById(requestId)
    return { success: true }
  }

  async status(actorId: string, targetId: string) {
    const row = await this.repo.getFollow(actorId, targetId)
    if (!row) return { status: 'NONE' as const }
    return { status: row.status }
  }

  async relationship(actorId: string, targetId: string) {
    const aToB = await this.repo.getFollow(actorId, targetId)
    const bToA = await this.repo.getFollow(targetId, actorId)
    const i_follow = aToB ? aToB.status : ('NONE' as const)
    const follows_me = bToA ? bToA.status : ('NONE' as const)
    const mutual = i_follow === 'APPROVED' && follows_me === 'APPROVED'
    return { i_follow, follows_me, mutual }
  }

  async followers(userId: string, skip: number, take: number) {
    return this.repo.listFollowers(userId, skip, take)
  }

  async following(userId: string, skip: number, take: number) {
    return this.repo.listFollowing(userId, skip, take)
  }

  async removeFollower(currentUserId: string, followerId: string) {
    const row = await this.repo.getFollow(followerId, currentUserId)
    if (!row || row.status !== 'APPROVED') {
      const e = new Error('Not a follower') as Error & { status?: number }
      e.status = 400
      throw e
    }
    await this.repo.removeFollow(followerId, currentUserId)
    return { success: true }
  }

  async mutuals(userId: string, skip: number, take: number) {
    return this.repo.listMutuals(userId, skip, take)
  }
}
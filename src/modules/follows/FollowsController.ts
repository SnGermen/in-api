import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import FollowsService from './FollowsService'

export default class FollowsController extends BaseController {
  public readonly router = Router()
  private service = new FollowsService()

  constructor() {
    super()
    this.router.post('/users/:id/follow', requireAuth, requireNotBanned, this.follow)
    this.router.delete('/users/:id/follow', requireAuth, requireNotBanned, this.unfollow)
    this.router.get('/users/:id/follow-status', requireAuth, this.followStatus)
    this.router.get('/users/:id/relationship', requireAuth, this.relationship)

    this.router.get('/users/:id/followers', query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.followers)
    this.router.get('/users/:id/following', query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.following)
    this.router.get('/users/:id/mutuals', query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.mutuals)

    this.router.get('/me/follow-requests', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.incoming)
    this.router.get('/me/follow-requests/outgoing', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.outgoing)
    this.router.post('/follow-requests/:id/approve', requireAuth, requireNotBanned, this.approve)
    this.router.post('/follow-requests/:id/reject', requireAuth, requireNotBanned, this.reject)
    this.router.delete('/me/followers/:id', requireAuth, requireNotBanned, this.removeFollower)
  }

  follow = async (req: Request, res: Response) => {
    const actorId = (req as Request & { user?: { id: string } }).user!.id
    const targetId = req.params.id
    const result = await this.service.follow(actorId, targetId)
    res.json(result)
  }

  unfollow = async (req: Request, res: Response) => {
    const actorId = (req as Request & { user?: { id: string } }).user!.id
    const targetId = req.params.id
    const result = await this.service.unfollow(actorId, targetId)
    res.json(result)
  }

  followStatus = async (req: Request, res: Response) => {
    const actorId = (req as Request & { user?: { id: string } }).user!.id
    const targetId = req.params.id
    const result = await this.service.status(actorId, targetId)
    res.json(result)
  }

  relationship = async (req: Request, res: Response) => {
    const actorId = (req as Request & { user?: { id: string } }).user!.id
    const targetId = req.params.id
    const result = await this.service.relationship(actorId, targetId)
    res.json(result)
  }

  followers = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const userId = req.params.id
    const items = await this.service.followers(userId, skip, take)
    res.json({ page, size, items })
  }

  following = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const userId = req.params.id
    const items = await this.service.following(userId, skip, take)
    res.json({ page, size, items })
  }

  mutuals = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const userId = req.params.id
    const items = await this.service.mutuals(userId, skip, take)
    res.json({ page, size, items })
  }

  incoming = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const currentUserId = (req as Request & { user?: { id: string } }).user!.id
    const items = await this.service.incomingRequests(currentUserId, skip, take)
    res.json({ page, size, items })
  }

  outgoing = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const currentUserId = (req as Request & { user?: { id: string } }).user!.id
    const items = await this.service.outgoingRequests(currentUserId, skip, take)
    res.json({ page, size, items })
  }

  approve = async (req: Request, res: Response) => {
    const currentUserId = (req as Request & { user?: { id: string } }).user!.id
    const id = req.params.id
    const result = await this.service.approve(currentUserId, id)
    res.json(result)
  }

  reject = async (req: Request, res: Response) => {
    const currentUserId = (req as Request & { user?: { id: string } }).user!.id
    const id = req.params.id
    const result = await this.service.reject(currentUserId, id)
    res.json(result)
  }

  removeFollower = async (req: Request, res: Response) => {
    const currentUserId = (req as Request & { user?: { id: string } }).user!.id
    const followerId = req.params.id
    const result = await this.service.removeFollower(currentUserId, followerId)
    res.json(result)
  }
}

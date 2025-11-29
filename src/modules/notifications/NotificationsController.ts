import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import NotificationsService from './NotificationsService'

export default class NotificationsController extends BaseController {
  public readonly router = Router()
  private service = new NotificationsService()

  constructor() {
    super()
    this.router.get('/me/notifications', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.list)
    this.router.get('/me/notifications/since', requireAuth, query('since').isISO8601(), query('limit').optional().isInt({ min: 1, max: 100 }), validate, this.listSince)
    this.router.get('/me/notifications/unread-count', requireAuth, this.unreadCount)
    this.router.post('/notifications/:id/read', requireAuth, this.markRead)
    this.router.post('/notifications/read-all', requireAuth, this.markAllRead)
  }

  list = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const items = await this.service.list(userId, skip, take)
    res.json({ page, size, items })
  }

  unreadCount = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const result = await this.service.unreadCount(userId)
    res.json(result)
  }

  markRead = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const id = req.params.id
    const result = await this.service.markRead(userId, id)
    res.json(result)
  }

  markAllRead = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const result = await this.service.markAllRead(userId)
    res.json(result)
  }

  listSince = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const since = new Date(String((req.query as Record<string, unknown>).since))
    const limit = (req.query as Record<string, unknown>).limit ? Number((req.query as Record<string, unknown>).limit) : 50
    const items = await this.service.listSince(userId, since, limit)
    res.json({ items })
  }
}
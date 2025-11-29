import { Router, Request, Response } from 'express'
import { body, query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import StoriesService from './StoriesService'

export default class StoriesController extends BaseController {
  public readonly router = Router()
  private service = new StoriesService()

  constructor() {
    super()
    this.router.post(
      '/stories',
      requireAuth,
      requireNotBanned,
      body('mediaIds').isArray({ min: 1 }),
      body('expiresInHours').optional().isInt({ min: 1, max: 168 }),
      validate,
      this.create
    )
    this.router.get('/stories', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.listAccessible)
    this.router.get('/users/:id/stories', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.listUser)
    this.router.delete('/stories/:id', requireAuth, requireNotBanned, this.remove)
  }

  create = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { mediaIds, expiresInHours } = req.body as { mediaIds: string[]; expiresInHours?: number }
    const story = await this.service.create(userId, mediaIds, expiresInHours)
    res.status(201).json({ story })
  }

  listAccessible = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.listAccessible(userId, skip, take)
    res.json({ page, size, items })
  }

  listUser = async (req: Request, res: Response) => {
    const requesterId = (req as Request & { user?: { id: string } }).user!.id
    const authorId = req.params.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.listForUser(requesterId, authorId, skip, take)
    res.json({ page, size, items })
  }

  remove = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const id = req.params.id
    const result = await this.service.remove(userId, id)
    res.json(result)
  }
}
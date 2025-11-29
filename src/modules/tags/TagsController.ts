import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import TagsService from './TagsService'

export default class TagsController extends BaseController {
  public readonly router = Router()
  private service = new TagsService()

  constructor() {
    super()
    this.router.get('/hashtags/trending', query('limit').optional().isInt({ min: 1, max: 50 }), validate, this.trending)
    this.router.get('/hashtags/:tag/posts', query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.postsPublic)
    this.router.get('/me/hashtags/:tag/posts', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.postsAccessible)
  }

  trending = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10
    const items = await this.service.trending(limit)
    res.json({ items })
  }

  postsPublic = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const tag = req.params.tag
    const items = await this.service.postsByTag(tag, undefined, skip, take)
    res.json({ page, size, items })
  }

  postsAccessible = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const tag = req.params.tag
    const viewerId = (req as Request & { user?: { id: string } }).user!.id
    const items = await this.service.postsByTag(tag, viewerId, skip, take)
    res.json({ page, size, items })
  }
}
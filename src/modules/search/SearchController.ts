import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import SearchService from './SearchService'

export default class SearchController extends BaseController {
  public readonly router = Router()
  private service = new SearchService()

  constructor() {
    super()
    this.router.get('/search/users', query('q').optional().isString(), query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.users)
    this.router.get('/search/posts', requireAuth, query('q').optional().isString(), query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.posts)
  }

  users = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const q = req.query.q as string | undefined
    const items = await this.service.users(q, skip, take)
    res.json({ page, size, items })
  }

  posts = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const q = req.query.q as string | undefined
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const items = await this.service.postsAccessible(q, userId, skip, take)
    res.json({ page, size, items })
  }
}
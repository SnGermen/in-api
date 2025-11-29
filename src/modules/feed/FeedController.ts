import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination, parseSort } from '../../utils/pagination'

import FeedService from './FeedService'

export default class FeedController extends BaseController {
  public readonly router = Router()
  private service = new FeedService()

  constructor() {
    super()
    this.router.get('/feed', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), query('sort').optional().isString(), validate, this.list)
  }

  list = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { page, size, skip, take } = getPagination(req.query)
    const orderBy = parseSort(req.query.sort as string | undefined)
    const items = await this.service.list(userId, skip, take, orderBy)
    res.json({ page, size, items })
  }
}
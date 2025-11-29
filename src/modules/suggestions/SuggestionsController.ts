import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import SuggestionsService from './SuggestionsService'

export default class SuggestionsController extends BaseController {
  public readonly router = Router()
  private service = new SuggestionsService()

  constructor() {
    super()
    this.router.get('/suggestions/users', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.users)
  }

  users = async (req: Request, res: Response) => {
    const currentUserId = (req as Request & { user?: { id: string } }).user!.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.users(currentUserId, skip, take)
    res.json({ page, size, items })
  }
}
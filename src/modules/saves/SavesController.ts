import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination, parseSort } from '../../utils/pagination'

import SavesService from './SavesService'

export default class SavesController extends BaseController {
  public readonly router = Router()
  private service = new SavesService()

  constructor() {
    super()
    this.router.post('/posts/:id/save', requireAuth, requireNotBanned, this.save)
    this.router.delete('/posts/:id/save', requireAuth, requireNotBanned, this.unsave)
    this.router.get('/me/saves', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), query('sort').optional().isString(), validate, this.list)
  }

  save = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const postId = req.params.id
    const result = await this.service.save(postId, userId)
    res.json(result)
  }

  unsave = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const postId = req.params.id
    const result = await this.service.unsave(postId, userId)
    res.json(result)
  }

  list = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { page, size, skip, take } = getPagination(req.query)
    const orderBy = parseSort(req.query.sort as string | undefined)
    const items = await this.service.list(userId, skip, take, orderBy)
    res.json({ page, size, items })
  }
}
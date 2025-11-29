import { Router, Request, Response } from 'express'
import { body, query } from 'express-validator'

import BaseController from '../../../core/http/controllers/BaseController'
import { requireAuth, requireAdmin } from '../../../core/http/middlewares/auth'
import { validate } from '../../../core/http/validators'
import { getPagination } from '../../../utils/pagination'

import AdminUsersService from './AdminUsersService'

export default class AdminUsersController extends BaseController {
  public readonly router = Router()
  private service = new AdminUsersService()

  constructor() {
    super()
    this.router.post('/users/:id/ban', requireAuth, requireAdmin, body('reason').optional().isString(), validate, this.ban)
    this.router.post('/users/:id/unban', requireAuth, requireAdmin, body('reason').optional().isString(), validate, this.unban)
    this.router.get('/users/:id/ban-log', requireAuth, requireAdmin, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.log)
  }

  ban = async (req: Request, res: Response) => {
    const adminId = (req as Request & { user?: { id: string } }).user!.id
    const userId = req.params.id
    const { reason } = req.body as { reason?: string }
    const result = await this.service.ban(adminId, userId, reason)
    res.json(result)
  }

  unban = async (req: Request, res: Response) => {
    const adminId = (req as Request & { user?: { id: string } }).user!.id
    const userId = req.params.id
    const { reason } = req.body as { reason?: string }
    const result = await this.service.unban(adminId, userId, reason)
    res.json(result)
  }

  log = async (req: Request, res: Response) => {
    const userId = req.params.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.listUserBans(userId, skip, take)
    res.json({ page, size, items })
  }
}
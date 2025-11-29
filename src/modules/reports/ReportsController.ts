import { Router, Request, Response } from 'express'
import { body, query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import ReportsService from './ReportsService'

export default class ReportsController extends BaseController {
  public readonly router = Router()
  private service = new ReportsService()

  constructor() {
    super()
    this.router.post(
      '/reports',
      requireAuth,
      requireNotBanned,
      body('targetType').isIn(['POST', 'COMMENT', 'USER']),
      body('targetId').isString(),
      body('reason').isString().isLength({ min: 3 }),
      validate,
      this.create
    )
    this.router.get('/me/reports', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.listMine)
  }

  create = async (req: Request, res: Response) => {
    const reporterId = (req as Request & { user?: { id: string } }).user!.id
    const { targetType, targetId, reason } = req.body as { targetType: 'POST' | 'COMMENT' | 'USER'; targetId: string; reason: string }
    const report = await this.service.create(reporterId, targetType, targetId, reason)
    res.status(201).json({ report })
  }

  listMine = async (req: Request, res: Response) => {
    const reporterId = (req as Request & { user?: { id: string } }).user!.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.listMine(reporterId, skip, take)
    res.json({ page, size, items })
  }
}
import { Router, Request, Response } from 'express'
import { query, body } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireAdmin } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import ReportsService from './ReportsService'

export default class AdminReportsController extends BaseController {
  public readonly router = Router()
  private service = new ReportsService()

  constructor() {
    super()
    this.router.get('/reports', requireAuth, requireAdmin, query('status').optional().isIn(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']), query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.list)
    this.router.post('/reports/:id/status', requireAuth, requireAdmin, body('status').isIn(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']), validate, this.updateStatus)
  }

  list = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const status = req.query.status as 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED' | undefined
    const items = await this.service.adminList(status, skip, take)
    res.json({ page, size, items })
  }

  updateStatus = async (req: Request, res: Response) => {
    const id = req.params.id
    const { status } = req.body as { status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED' }
    const result = await this.service.adminUpdateStatus(id, status)
    res.json(result)
  }
}
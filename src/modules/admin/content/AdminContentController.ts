import { Router, Request, Response } from 'express'

import BaseController from '../../../core/http/controllers/BaseController'
import { requireAuth, requireAdmin } from '../../../core/http/middlewares/auth'

import AdminContentService from './AdminContentService'

export default class AdminContentController extends BaseController {
  public readonly router = Router()
  private service = new AdminContentService()

  constructor() {
    super()
    this.router.post('/posts/:id/hide', requireAuth, requireAdmin, this.hidePost)
    this.router.post('/posts/:id/restore', requireAuth, requireAdmin, this.restorePost)
    this.router.post('/comments/:id/hide', requireAuth, requireAdmin, this.hideComment)
    this.router.post('/comments/:id/restore', requireAuth, requireAdmin, this.restoreComment)
  }

  hidePost = async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await this.service.hidePost(id)
    res.json(result)
  }

  restorePost = async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await this.service.restorePost(id)
    res.json(result)
  }

  hideComment = async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await this.service.hideComment(id)
    res.json(result)
  }

  restoreComment = async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await this.service.restoreComment(id)
    res.json(result)
  }
}
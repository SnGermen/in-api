import { Router, Request, Response } from 'express'
import { body, query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import CommentsService from './CommentsService'

export default class CommentsController extends BaseController {
  public readonly router = Router()
  private service = new CommentsService()

  constructor() {
    super()
    this.router.post(
      '/posts/:id/comments',
      requireAuth,
      requireNotBanned,
      body('text').isString().isLength({ min: 1, max: 1000 }),
      body('parentId').optional().isString(),
      validate,
      this.add
    )
    this.router.get(
      '/posts/:id/comments',
      query('page').optional().isInt({ min: 1 }),
      query('size').optional().isInt({ min: 1, max: 100 }),
      validate,
      this.list
    )
    this.router.patch('/comments/:id', requireAuth, requireNotBanned, body('text').isString().isLength({ min: 1, max: 1000 }), validate, this.update)
    this.router.delete('/comments/:id', requireAuth, requireNotBanned, this.remove)
  }

  add = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const postId = req.params.id
    const { text, parentId } = req.body as { text: string; parentId?: string }
    const comment = await this.service.addToPost(postId, userId, text, parentId)
    res.status(201).json({ comment })
  }

  list = async (req: Request, res: Response) => {
    const postId = req.params.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.list(postId, skip, take)
    res.json({ page, size, items })
  }

  update = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const id = req.params.id
    const { text } = req.body as { text: string }
    const comment = await this.service.update(userId, id, text)
    res.json({ comment })
  }

  remove = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const id = req.params.id
    const result = await this.service.remove(userId, id)
    res.json(result)
  }
}
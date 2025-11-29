import { Router, Request, Response } from 'express'
import { body, query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination, parseSort } from '../../utils/pagination'

import PostsService from './PostsService'

export default class PostsController extends BaseController {
  public readonly router = Router()
  private service = new PostsService()

  constructor() {
    super()
    this.router.post(
      '/',
      requireAuth,
      requireNotBanned,
      body('caption').optional({ nullable: true }).isString(),
      body('mediaIds').optional().isArray(),
      validate,
      this.create
    )
    this.router.get(
      '/',
      query('authorId').optional().isString(),
      query('from').optional().isISO8601(),
      query('to').optional().isISO8601(),
      query('page').optional().isInt({ min: 1 }),
      query('size').optional().isInt({ min: 1, max: 100 }),
      query('sort').optional().isString(),
      validate,
      this.list
    )
    this.router.get('/:id', this.get)
    this.router.patch('/:id', requireAuth, requireNotBanned, body('caption').optional({ nullable: true }).isString(), validate, this.update)
    this.router.delete('/:id', requireAuth, requireNotBanned, this.remove)
  }

  create = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { caption, mediaIds } = req.body as { caption?: string; mediaIds?: string[] }
    const post = await this.service.create(userId, caption, mediaIds ?? [])
    res.status(201).json({ post })
  }

  get = async (req: Request, res: Response) => {
    const post = await this.service.get(req.params.id)
    res.json({ post })
  }

  update = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const post = await this.service.update(userId, req.params.id, req.body.caption)
    res.json({ post })
  }

  remove = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const result = await this.service.remove(userId, req.params.id)
    res.json(result)
  }

  list = async (req: Request, res: Response) => {
    const { page, size, skip, take } = getPagination(req.query)
    const orderBy = parseSort(req.query.sort as string | undefined)
    const from = req.query.from ? new Date(String(req.query.from)) : undefined
    const to = req.query.to ? new Date(String(req.query.to)) : undefined
    const authorId = (req.query.authorId as string | undefined) || undefined
    const authUser = (req as Request & { user?: { id: string } }).user
    const posts = authUser
      ? await this.service.listForUser(authUser.id, { authorId, from, to, skip, take, orderBy })
      : await this.service.list({ authorId, from, to, skip, take, orderBy })
    res.json({ page, size, items: posts })
  }
}
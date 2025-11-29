import { Router, Request, Response } from 'express'
import { query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import LikesService from './LikesService'

export default class LikesController extends BaseController {
  public readonly router = Router()
  private service = new LikesService()

  constructor() {
    super()
    this.router.post('/posts/:id/likes', requireAuth, requireNotBanned, this.likePost)
    this.router.delete('/posts/:id/likes', requireAuth, requireNotBanned, this.unlikePost)
    this.router.get('/posts/:id/likes', query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.listPostLikes)

    this.router.post('/comments/:id/likes', requireAuth, requireNotBanned, this.likeComment)
    this.router.delete('/comments/:id/likes', requireAuth, requireNotBanned, this.unlikeComment)
    this.router.get('/comments/:id/likes', query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.listCommentLikes)
  }

  likePost = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const postId = req.params.id
    const result = await this.service.likePost(postId, userId)
    res.json(result)
  }

  unlikePost = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const postId = req.params.id
    const result = await this.service.unlikePost(postId, userId)
    res.json(result)
  }

  listPostLikes = async (req: Request, res: Response) => {
    const postId = req.params.id
    const { page, size, skip, take } = getPagination(req.query)
    const users = await this.service.listPostLikes(postId, skip, take)
    res.json({ page, size, items: users })
  }

  likeComment = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const commentId = req.params.id
    const result = await this.service.likeComment(commentId, userId)
    res.json(result)
  }

  unlikeComment = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const commentId = req.params.id
    const result = await this.service.unlikeComment(commentId, userId)
    res.json(result)
  }

  listCommentLikes = async (req: Request, res: Response) => {
    const commentId = req.params.id
    const { page, size, skip, take } = getPagination(req.query)
    const users = await this.service.listCommentLikes(commentId, skip, take)
    res.json({ page, size, items: users })
  }
}
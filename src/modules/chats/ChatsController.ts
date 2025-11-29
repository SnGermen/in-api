import { Router, Request, Response } from 'express'
import { body, query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'
import { validate } from '../../core/http/validators'
import { getPagination } from '../../utils/pagination'

import ChatsService from './ChatsService'

export default class ChatsController extends BaseController {
  public readonly router = Router()
  private service = new ChatsService()

  constructor() {
    super()
    this.router.post('/conversations', requireAuth, requireNotBanned, body('userId').isString(), validate, this.start)
    this.router.get('/conversations', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.list)
    this.router.post('/conversations/:id/messages', requireAuth, requireNotBanned, body('text').isString().isLength({ min: 1, max: 2000 }), validate, this.send)
    this.router.get('/conversations/:id/messages', requireAuth, query('page').optional().isInt({ min: 1 }), query('size').optional().isInt({ min: 1, max: 100 }), validate, this.messages)
  }

  start = async (req: Request, res: Response) => {
    const actorId = (req as Request & { user?: { id: string } }).user!.id
    const { userId } = req.body as { userId: string }
    const convo = await this.service.startConversation(actorId, userId)
    res.status(201).json({ conversation: convo })
  }

  list = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.listConversations(userId, skip, take)
    res.json({ page, size, items })
  }

  send = async (req: Request, res: Response) => {
    const authorId = (req as Request & { user?: { id: string } }).user!.id
    const conversationId = req.params.id
    const { text } = req.body as { text: string }
    const msg = await this.service.sendMessage(conversationId, authorId, text)
    res.status(201).json({ message: msg })
  }

  messages = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const conversationId = req.params.id
    const { page, size, skip, take } = getPagination(req.query)
    const items = await this.service.listMessages(conversationId, userId, skip, take)
    res.json({ page, size, items })
  }
}
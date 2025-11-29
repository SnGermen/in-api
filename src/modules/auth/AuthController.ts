import { Router, Request, Response } from 'express'
import { body, query } from 'express-validator'

import BaseController from '../../core/http/controllers/BaseController'
import { validate } from '../../core/http/validators'
import { requireAuth, requireNotBanned } from '../../core/http/middlewares/auth'

import AuthService from './AuthService'

export default class AuthController extends BaseController {
  public readonly router = Router()
  private service = new AuthService()

  constructor() {
    super()
    this.router.post(
      '/register',
      body('email').isEmail(),
      body('username').isString().isLength({ min: 3, max: 32 }),
      body('password').isString().isLength({ min: 6 }),
      validate,
      this.register
    )
    this.router.post(
      '/login',
      body('identifier').isString().isLength({ min: 3 }),
      body('password').isString().isLength({ min: 6 }),
      validate,
      this.login
    )
    this.router.get('/me', requireAuth, this.me)
    this.router.patch(
      '/me',
      requireAuth,
      body('fullName').optional({ nullable: true }).isString(),
      body('bio').optional({ nullable: true }).isString(),
      body('isPrivate').optional().isBoolean(),
      validate,
      this.updateMe
    )
    this.router.patch(
      '/password',
      requireAuth,
      body('currentPassword').isString().isLength({ min: 6 }),
      body('newPassword').isString().isLength({ min: 6 }),
      validate,
      this.changePassword
    )

    this.router.patch('/me/avatar', requireAuth, requireNotBanned, body('mediaId').isString(), validate, this.setAvatar)
    this.router.delete('/me/avatar', requireAuth, requireNotBanned, this.clearAvatar)

    this.router.get('/check-username', query('username').isString().isLength({ min: 3, max: 32 }), validate, this.checkUsername)
    this.router.get('/check-email', query('email').isEmail(), validate, this.checkEmail)
  }

  register = async (req: Request, res: Response) => {
    const { email, username, password } = req.body as { email: string; username: string; password: string }
    const result = await this.service.register(email, username, password)
    res.status(201).json(result)
  }

  login = async (req: Request, res: Response) => {
    const { identifier, password } = req.body as { identifier: string; password: string }
    const result = await this.service.login(identifier, password)
    res.json(result)
  }

  me = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const user = await this.service.me(userId)
    res.json({ user })
  }

  updateMe = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { fullName, bio, isPrivate } = req.body as {
      fullName?: string | null
      bio?: string | null
      isPrivate?: boolean
    }
    const user = await this.service.updateMe(userId, { fullName, bio, isPrivate })
    res.json({ user })
  }

  changePassword = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string }
    const result = await this.service.changePassword(userId, currentPassword, newPassword)
    res.json(result)
  }

  setAvatar = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const { mediaId } = req.body as { mediaId: string }
    const user = await this.service.setAvatar(userId, mediaId)
    res.json({ user })
  }

  clearAvatar = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const user = await this.service.clearAvatar(userId)
    res.json({ user })
  }

  checkUsername = async (req: Request, res: Response) => {
    const { username } = req.query as { username: string }
    const result = await this.service.checkUsernameAvailability(username)
    res.json(result)
  }

  checkEmail = async (req: Request, res: Response) => {
    const { email } = req.query as { email: string }
    const result = await this.service.checkEmailAvailability(email)
    res.json(result)
  }
}
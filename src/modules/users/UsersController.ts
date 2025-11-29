import { Router, Request, Response } from 'express'

import BaseController from '../../core/http/controllers/BaseController'

import UsersService from './UsersService'

export default class UsersController extends BaseController {
  public readonly router = Router()
  private service = new UsersService()

  constructor() {
    super()
    this.router.get('/users/:id', this.get)
  }

  get = async (req: Request, res: Response) => {
    const viewerId = (req as Request & { user?: { id: string } }).user?.id
    const id = req.params.id
    const result = await this.service.getProfile(id, viewerId)
    res.json(result)
  }
}
import { Router, Request, Response, NextFunction } from 'express'

import BaseController from '../../core/http/controllers/BaseController'
import { requireAuth } from '../../core/http/middlewares/auth'
import { createImageUpload } from '../../middleware/upload'

import MediaService from './MediaService'

function useImageUpload() {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    return createImageUpload(userId).single('file')(req, res, next)
  }
}

export default class MediaController extends BaseController {
  public readonly router = Router()
  private service = new MediaService()

  constructor() {
    super()
    this.router.post('/', requireAuth, useImageUpload(), this.upload)
    this.router.delete('/:id', requireAuth, this.remove)
  }

  upload = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const result = await this.service.upload(userId, req.file as Express.Multer.File)
    res.status(201).json(result)
  }

  remove = async (req: Request, res: Response) => {
    const userId = (req as Request & { user?: { id: string } }).user!.id
    const id = req.params.id
    const result = await this.service.remove(userId, id)
    res.json(result)
  }
}
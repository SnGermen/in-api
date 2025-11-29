import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import env from '../../../config/env'
import AuthRepository from '../../../modules/auth/AuthRepository'

export type AuthContext = { id: string; role: 'USER' | 'ADMIN' }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = header.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: 'USER' | 'ADMIN' }
    ;(req as Request & { user?: AuthContext }).user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: AuthContext }).user
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' })
  next()
}

export async function requireNotBanned(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: AuthContext }).user
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const repo = new AuthRepository()
  const u = await repo.findById(user.id)
  if (!u) return res.status(401).json({ error: 'Unauthorized' })
  if (u.isBanned) return res.status(403).json({ error: 'Forbidden' })
  next()
}
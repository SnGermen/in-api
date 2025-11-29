import { Request, Response, NextFunction } from 'express'

type HttpError = Error & { status?: number }

export function notFound(_req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ error: 'Not Found' })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const e = err as HttpError
  const status = e.status ?? 500
  const message = e.message || 'Internal Server Error'
  res.status(status).json({ error: message })
}
import fs from 'fs'
import path from 'path'

import multer from 'multer'

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function getExtFromMime(mime: string) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'bin'
}

function monthDir() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

export function createImageUpload(userId: string) {
  const dest = path.resolve('uploads/images', userId, monthDir())
  ensureDir(dest)

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = getExtFromMime(file.mimetype)
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      cb(null, name)
    }
  })

  const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Unsupported file type'))
  }

  return multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })
}
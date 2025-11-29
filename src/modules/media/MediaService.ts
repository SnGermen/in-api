import fs from 'fs/promises'
import path from 'path'

import BaseService from '../../core/services/BaseService'

import MediaRepository from './MediaRepository'

export default class MediaService extends BaseService {
  private repo = new MediaRepository()

  async upload(ownerId: string, file: Express.Multer.File) {
    if (!file) {
      const e = new Error('File is required') as Error & { status?: number }
      e.status = 400
      throw e
    }
    const abs = file.destination ? path.join(file.destination, file.filename) : file.path
    const relStart = path.resolve('uploads')
    const relative = abs.startsWith(relStart) ? path.relative(relStart, abs) : path.basename(abs)
    const media = await this.repo.create(ownerId, relative, null, null)
    const url = `/uploads/${relative.replace(/\\/g, '/')}`
    return { id: media.id, url, path: relative, width: media.width, height: media.height }
  }

  async remove(ownerId: string, id: string) {
    const m = await this.repo.findById(id)
    if (!m) {
      const e = new Error('Not found') as Error & { status?: number }
      e.status = 404
      throw e
    }
    if (m.ownerId !== ownerId) {
      const e = new Error('Forbidden') as Error & { status?: number }
      e.status = 403
      throw e
    }
    const usage = await this.repo.usageCounts(id)
    if (usage.postMedia > 0 || usage.storyMedia > 0 || usage.avatarUsers > 0) {
      const e = new Error('Media is in use') as Error & { status?: number }
      e.status = 409
      throw e
    }

    await this.repo.delete(id)
    const abs = path.resolve('uploads', m.path)
    try {
      await fs.unlink(abs)
    } catch {}
    return { success: true }
  }
}
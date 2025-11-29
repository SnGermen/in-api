import { Prisma } from '@prisma/client'

import prisma from '../../config/prisma'

export default class BaseRepository {
  protected prisma = prisma
  protected userPublicSelect: Prisma.UserSelect = {
    id: true,
    username: true,
    fullName: true,
    bio: true,
    isPrivate: true,
    avatarMediaId: true
  }
}

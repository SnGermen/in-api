import path from 'path'
import fs from 'fs/promises'

import 'dotenv/config'
import bcrypt from 'bcrypt'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickUnique<T>(items: T[], count: number, exclude?: T) {
  const pool = exclude ? items.filter((i) => i !== exclude) : [...items]
  const result: T[] = []
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool[idx]!)
    pool.splice(idx, 1)
  }
  return result
}

async function ensureDirs() {
  const uploads = path.resolve('uploads')
  const demo = path.resolve('uploads/images/demo')
  await fs.mkdir(uploads, { recursive: true })
  await fs.mkdir(demo, { recursive: true })
}

async function copyAssetToDemo(srcAbs: string) {
  const ext = path.extname(srcAbs).toLowerCase() || '.jpg'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const rel = path.join('images', 'demo', name).replace(/\\/g, '/')
  const abs = path.resolve('uploads', rel)
  await fs.copyFile(srcAbs, abs)
  return rel
}

async function main() {
  await ensureDirs()

  const existingUsers = await prisma.user.count()
  if (existingUsers > 0) {
    console.log('Seed skipped: data already present')
    return
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? '10')
  const commonPassword = await bcrypt.hash('password123', saltRounds)
  const adminPassword = await bcrypt.hash('admin123', saltRounds)

  const assetDir = path.resolve('seed_assets')
  let assetFiles: string[] = []
  try {
    const files = await fs.readdir(assetDir)
    assetFiles = files.filter((f) => f.toLowerCase().endsWith('.jpg')).map((f) => path.join(assetDir, f))
  } catch {}
  if (assetFiles.length === 0) {
    throw new Error('No seed assets found in seed_assets/. Please add demo*.jpg files.')
  }

  // Users (20 regular + 1 admin)
  const users: { id: string; username: string }[] = []
  for (let i = 0; i < 20; i++) {
    const u = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName: faker.person.firstName(), lastName: faker.person.lastName() }).toLowerCase(),
        username: `${faker.internet.username().toLowerCase()}_${i}`,
        passwordHash: commonPassword,
        fullName: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        isPrivate: Math.random() < 0.3,
        role: 'USER'
      }
    })
    users.push({ id: u.id, username: u.username })
  }
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      bio: 'System administrator',
      isPrivate: false,
      role: 'ADMIN'
    }
  })
  users.push({ id: admin.id, username: admin.username })

  // Follows (3–10 per user)
  for (const u of users) {
    const count = rand(3, 10)
    const others = pickUnique(users.map((x) => x.id), count, u.id)
    if (others.length > 0) {
      const data = others.map((followingId) => ({ followerId: u.id, followingId, status: 'APPROVED' as const }))
      await prisma.follow.createMany({ data, skipDuplicates: true })
    }
  }

  // Posts + media, likes, comments
  for (const u of users) {
    const postsCount = rand(5, 12)
    for (let p = 0; p < postsCount; p++) {
      const post = await prisma.post.create({
        data: {
          authorId: u.id,
          caption: Math.random() < 0.8 ? faker.lorem.sentence() : null,
          location: Math.random() < 0.2 ? faker.location.city() : null
        }
      })

      const imagesCount = rand(1, 3)
      const chosen = pickUnique(assetFiles, imagesCount)
      for (let idx = 0; idx < chosen.length; idx++) {
        const rel = await copyAssetToDemo(chosen[idx]!)
        const media = await prisma.media.create({ data: { ownerId: u.id, type: 'IMAGE', path: rel, width: null, height: null } })
        await prisma.postMedia.create({ data: { postId: post.id, mediaId: media.id, order: idx } })
      }

      // Likes (0–100)
      const likesCount = rand(0, 100)
      if (likesCount > 0) {
        const likers = pickUnique(users.map((x) => x.id), likesCount, u.id)
        const likeData = likers.map((uid) => ({ postId: post.id, userId: uid }))
        await prisma.postLike.createMany({ data: likeData, skipDuplicates: true })
      }

      // Comments (0–20)
      const commentsCount = rand(0, 20)
      if (commentsCount > 0) {
        const commenters = pickUnique(users.map((x) => x.id), commentsCount, undefined)
        const commentData = commenters.map((uid) => ({ postId: post.id, authorId: uid, text: faker.lorem.sentence() }))
        await prisma.comment.createMany({ data: commentData })
      }
    }
  }

  // Stories (0–5 per user)
  for (const u of users) {
    const storiesCount = rand(0, 5)
    for (let s = 0; s < storiesCount; s++) {
      const story = await prisma.story.create({ data: { authorId: u.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
      const asset = pickUnique(assetFiles, 1)[0]!
      const rel = await copyAssetToDemo(asset)
      const media = await prisma.media.create({ data: { ownerId: u.id, type: 'IMAGE', path: rel, width: null, height: null } })
      await prisma.storyMedia.create({ data: { storyId: story.id, mediaId: media.id } })
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
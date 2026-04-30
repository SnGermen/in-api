import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      media: { none: {} }
    },
    select: { id: true }
  })

  if (posts.length === 0) {
    console.log('No posts without media found.')
    return
  }

  const ids = posts.map((post) => post.id)
  console.log(`Found ${ids.length} posts without media. Deleting...`)

  await prisma.commentLike.deleteMany({
    where: {
      comment: {
        postId: { in: ids }
      }
    }
  })

  await prisma.comment.deleteMany({
    where: {
      postId: { in: ids }
    }
  })

  await prisma.postLike.deleteMany({
    where: {
      postId: { in: ids }
    }
  })

  await prisma.savedPost.deleteMany({
    where: {
      postId: { in: ids }
    }
  })

  await prisma.post.deleteMany({
    where: {
      id: { in: ids }
    }
  })

  console.log(`Deleted ${ids.length} posts without media and related likes/comments/saves.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

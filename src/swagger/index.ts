import path from 'path'

export const swaggerFiles = [
  path.resolve(process.cwd(), 'src/swagger/auth.yaml'),
  path.resolve(process.cwd(), 'src/swagger/users.yaml'),
  path.resolve(process.cwd(), 'src/swagger/posts.yaml'),
  path.resolve(process.cwd(), 'src/swagger/comments.yaml'),
  path.resolve(process.cwd(), 'src/swagger/stories.yaml'),
  path.resolve(process.cwd(), 'src/swagger/likes.yaml'),
  path.resolve(process.cwd(), 'src/swagger/admin.yaml')
]

export default swaggerFiles
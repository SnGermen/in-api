import swaggerUi from 'swagger-ui-express'

import env from './config/env'
import app from './app'
import logger from './utils/logger'
import swaggerSpec from './config/swagger'
import { notFound, errorHandler } from './core/http/middlewares/error'

const port = env.PORT

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  logger.info({ port }, 'Server listening')
})

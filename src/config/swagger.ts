import swaggerJSDoc, { Options } from 'swagger-jsdoc'

import { swaggerFiles } from '../swagger'

import env from './env'

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'In API',
      version: '1.0.0'
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api/v1` },
      { url: `http://localhost:${env.PORT}/api/admin/v1` }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: swaggerFiles
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
export { swaggerSpec }
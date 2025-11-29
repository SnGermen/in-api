import path from 'path'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import env from './config/env'
import adminRouter from './routes/admin'
import router from './routes/index'


const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.resolve('uploads')))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use('/api/v1', router)
app.use('/api/admin/v1', adminRouter)

export default app

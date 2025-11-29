import { Router } from 'express'

import AdminReportsController from '../modules/reports/AdminReportsController'
import AdminUsersController from '../modules/admin/users/AdminUsersController'
import AdminContentController from '../modules/admin/content/AdminContentController'

const router = Router()
const reports = new AdminReportsController()
const adminUsers = new AdminUsersController()
const content = new AdminContentController()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

router.use('/', reports.router)
router.use('/', adminUsers.router)
router.use('/', content.router)

export default router
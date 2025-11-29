import { Router } from 'express'

import AuthController from '../modules/auth/AuthController'
import MediaController from '../modules/media/MediaController'
import PostsController from '../modules/posts/PostsController'
import CommentsController from '../modules/comments/CommentsController'
import LikesController from '../modules/likes/LikesController'
import FollowsController from '../modules/follows/FollowsController'
import FeedController from '../modules/feed/FeedController'
import SearchController from '../modules/search/SearchController'
import SavesController from '../modules/saves/SavesController'
import NotificationsController from '../modules/notifications/NotificationsController'
import StoriesController from '../modules/stories/StoriesController'
import ReportsController from '../modules/reports/ReportsController'
import SuggestionsController from '../modules/suggestions/SuggestionsController'
import UsersController from '../modules/users/UsersController'
import ChatsController from '../modules/chats/ChatsController'
import TagsController from '../modules/tags/TagsController'

const router = Router()
const auth = new AuthController()
const media = new MediaController()
const posts = new PostsController()
const comments = new CommentsController()
const likes = new LikesController()
const follows = new FollowsController()
const feed = new FeedController()
const search = new SearchController()
const saves = new SavesController()
const notifications = new NotificationsController()
const stories = new StoriesController()
const reports = new ReportsController()
const suggestions = new SuggestionsController()
const users = new UsersController()
const chats = new ChatsController()
const tags = new TagsController()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

router.get('/version', (_req, res) => {
  res.json({ version: 'v1' })
})

router.use('/auth', auth.router)
router.use('/media', media.router)
router.use('/posts', posts.router)
router.use('/', comments.router)
router.use('/', likes.router)
router.use('/', follows.router)
router.use('/', feed.router)
router.use('/', search.router)
router.use('/', saves.router)
router.use('/', notifications.router)
router.use('/', stories.router)
router.use('/', reports.router)
router.use('/', suggestions.router)
router.use('/', users.router)
router.use('/', chats.router)
router.use('/', tags.router)

export default router
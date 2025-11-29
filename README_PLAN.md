# Instagram-клон: Backend (Express + TypeScript + PostgreSQL)

Простой, но продуманный  backend-проект с двухуровневым API (клиентский и админский), строгими слоями (контроллеры → сервисы → репозитории), локальным хранением изображений и полной функциональностью Instagram.

## Архитектура

- Язык: TypeScript (строгая типизация)
- Фреймворк: Express
- Слои:
  - Контроллеры — принимают HTTP-запросы, вызывают сервисы, возвращают HTTP-ответы
  - Сервисы — бизнес-логика, инварианты, правила приватности
  - Репозитории — доступ к данным (PostgreSQL через ORM)
- Вспомогательные слои: middleware, валидаторы, мапперы DTO, утилиты
- Структура модулей по доменам: `auth`, `users`, `posts`, `comments`, `likes`, `follows`, `stories`, `notifications`, `search`, `saves`, `reports`, `admin`, `media`
- Хранилище изображений: локально (через `multer` + файловую систему, каталог `uploads/`)
- Версионирование API: `/api/v1/...` (клиент), `/api/admin/v1/...` (админ)

## ORM: Prisma vs TypeORM — выбор

Выбор: Prisma

Причины:
- Простой старт и понятная декларативная схема (`schema.prisma`), быстрая генерация типобезопасного клиента
- Сильная поддержка TypeScript: автогенерируемые типы для запросов, минимизация ручных маппингов
- Миграции из коробки, удобные инструменты (`prisma migrate`, `prisma studio`)

Как мы используем ООП-подход:
- Репозитории — классы-обертки над Prisma Client (инкапсулируют запросы, агрегаты, транзакции)
- Сервисы — классы, координирующие работу нескольких репозиториев, реализуют правила доступа/приватности
- Контроллеры — классы, отвечающие за HTTP-слой и валидацию входных данных

## Дерево директорий (план)

```
src/
  app.ts
  server.ts
  config/
    env.ts
    logger.ts
  db/
    prisma/
      schema.prisma
      client.ts
  core/
    http/
      controllers/
        BaseController.ts
      middlewares/
        auth.ts
        error.ts
        upload.ts
      validators/
        index.ts
    services/
      BaseService.ts
    repositories/
      BaseRepository.ts
  modules/
    auth/
      AuthController.ts
      AuthService.ts
      AuthRepository.ts
      dto/
        AuthDTO.ts
    users/
      UsersController.ts
      UsersService.ts
      UsersRepository.ts
      dto/
        UserDTO.ts
    posts/
      PostsController.ts
      PostsService.ts
      PostsRepository.ts
      dto/
        PostDTO.ts
    comments/
      CommentsController.ts
      CommentsService.ts
      CommentsRepository.ts
    likes/
      LikesController.ts
      LikesService.ts
      LikesRepository.ts
    follows/
      FollowsController.ts
      FollowsService.ts
      FollowsRepository.ts
    stories/
      StoriesController.ts
      StoriesService.ts
      StoriesRepository.ts
    notifications/
      NotificationsController.ts
      NotificationsService.ts
      NotificationsRepository.ts
    search/
      SearchController.ts
      SearchService.ts
      SearchRepository.ts
    saves/
      SavesController.ts
      SavesService.ts
      SavesRepository.ts
    reports/
      ReportsController.ts
      ReportsService.ts
      ReportsRepository.ts
    admin/
      AdminController.ts
      AdminService.ts
      AdminRepository.ts
    media/
      MediaController.ts
      MediaService.ts
      MediaRepository.ts
  routes/
    index.ts
    admin.ts
  utils/
    pagination.ts
    file.ts
    security.ts
uploads/  (локальное хранилище изображений)
prisma/
  migrations/
```

Примечания:
- Реальные файлы будут создаваться итеративно, по мере реализации
- `uploads/` — каталог для файлов, путь хранится в БД

## Хранилище изображений (локально)

- Middleware: `multer` c `diskStorage`
- Ограничения: типы файлов (jpeg/png/webp), максимальный размер, уникальные имена
- Путь хранения: `uploads/<userId>/<yyyy-mm>/<uuid>.<ext>`
- Безопасность: проверка MIME, нормализация пути, недоступность произвольного чтения вне каталога `uploads`

## Схема БД (PostgreSQL)

Основные таблицы и связи (упрощенно):

- `users`
  - `id` (PK), `email` (unique), `username` (unique), `password_hash`, `full_name`, `bio`
  - `avatar_media_id` (FK → `media.id`, nullable)
  - `is_private` (boolean), `role` (enum: USER|ADMIN), `is_banned` (boolean)
  - `created_at`, `updated_at`

- `follows`
  - `id` (PK), `follower_id` (FK → `users`), `following_id` (FK → `users`)
  - `status` (enum: APPROVED|PENDING)
  - уникальный составной индекс `(follower_id, following_id)`

- `posts`
  - `id` (PK), `author_id` (FK → `users`), `caption`, `location`
  - `deleted_at` (nullable — мягкое удаление)
  - `created_at`, `updated_at`

- `post_media`
  - `id` (PK), `post_id` (FK → `posts`), `type` (enum: IMAGE), `path`, `width`, `height`

- `comments`
  - `id` (PK), `post_id` (FK → `posts`), `author_id` (FK → `users`), `text`
  - `parent_id` (FK → `comments`, nullable) — ответы
  - `deleted_at` (nullable)
  - `created_at`, `updated_at`

- `post_likes`
  - `id` (PK), `post_id` (FK → `posts`), `user_id` (FK → `users`)
  - уникальный составной индекс `(post_id, user_id)`

- `comment_likes`
  - `id` (PK), `comment_id` (FK → `comments`), `user_id` (FK → `users`)
  - уникальный составной индекс `(comment_id, user_id)`

- `stories`
  - `id` (PK), `author_id` (FK → `users`), `expires_at`
  - `created_at`

- `story_media`
  - `id` (PK), `story_id` (FK → `stories`), `type` (enum: IMAGE), `path`, `width`, `height`

- `saved_posts`
  - `id` (PK), `post_id` (FK → `posts`), `user_id` (FK → `users`)
  - уникальный составной индекс `(post_id, user_id)`

- `notifications`
  - `id` (PK), `user_id` (получатель, FK → `users`), `actor_id` (инициатор, FK → `users`)
  - `type` (enum: LIKE_POST|LIKE_COMMENT|COMMENT|FOLLOW|FOLLOW_ACCEPTED|POST_SAVED)
  - `entity_type` (enum: POST|COMMENT|USER), `entity_id`
  - `is_read` (boolean), `created_at`

- `reports`
  - `id` (PK), `reporter_id` (FK → `users`), `target_type` (enum: POST|COMMENT|USER), `target_id`
  - `reason` (text), `status` (enum: OPEN|IN_REVIEW|RESOLVED|REJECTED)
  - `created_at`, `updated_at`

Индексы:
- Поисковые: `users(username,email)`, `posts(created_at, author_id)`, `comments(post_id, created_at)`
- Фильтрация: `saved_posts(user_id)`, `post_likes(post_id)`, `follows(following_id, status)`

Приватность:
- `users.is_private` + `follows.status` управляют доступом к контенту
- Если профиль приватный, контент виден только при наличии `follows.status = APPROVED`

Удаление:
- Посты/комментарии — мягкое удаление через `deleted_at`
- Медиаданные — удаление файла с диска + запись в БД

## API — Клиент (`/api/v1`)

Аутентификация
- `POST /auth/register` — регистрация (email, username, password)
- `POST /auth/login` — вход (JWT)
- `POST /auth/logout` — выход (инвалидировать refresh, если используется)
- `GET /auth/me` — профиль текущего пользователя
- `PATCH /auth/me` — обновление профиля (bio, full_name, avatar)
- `PATCH /auth/password` — смена пароля

Профиль пользователя
- `GET /users/:id` — профиль (учет приватности)
- `GET /users/:id/followers?page&size` — список подписчиков
- `GET /users/:id/following?page&size` — список подписок
- `PATCH /me/privacy` — переключение приватности (`is_private`)

Медиа (загрузка изображений)
- `POST /media` — загрузка изображения (multipart), возвращает `{id, url, path, width, height}`
- `DELETE /media/:id` — удалить незакрепленное медиа

Посты
- `POST /posts` — создать пост (`caption`, массив `mediaIds`)
- `GET /posts/:id` — получить пост
- `PATCH /posts/:id` — изменить пост (caption)
- `DELETE /posts/:id` — удалить пост (soft)
- `GET /posts?authorId&from&to&page&size&sort` — список/фильтры
- `GET /feed?page&size` — лента (учет приватности + подписки)

Сторисы
- `POST /stories` — создать сторис (mediaId)
- `GET /stories?userId&page&size` — сторисы пользователя
- `GET /stories/feed?page&size` — сторисы подписок (не показывать истекшие)
- `DELETE /stories/:id` — удалить сторис

Комментарии
- `POST /posts/:id/comments` — добавить комментарий (`text`, `parentId?`)
- `GET /posts/:id/comments?page&size` — список комментариев
- `PATCH /comments/:id` — изменить комментарий
- `DELETE /comments/:id` — удалить комментарий (soft)

Лайки
- `POST /posts/:id/likes` — поставить лайк посту
- `DELETE /posts/:id/likes` — снять лайк
- `GET /posts/:id/likes?page&size` — кто лайкнул пост
- `POST /comments/:id/likes` — лайк комментария
- `DELETE /comments/:id/likes` — снять лайк комментария
- `GET /comments/:id/likes?page&size` — кто лайкнул комментарий

Подписки
- `POST /users/:id/follow` — подписаться (для приватных — заявка `PENDING`)
- `DELETE /users/:id/follow` — отписаться
- `GET /me/follow-requests?page&size` — входящие заявки
- `POST /follow-requests/:id/approve` — одобрить заявку
- `POST /follow-requests/:id/reject` — отклонить заявку
- `GET /users/:id/follow-status` — статус отношения (нет/заявка/подписан)

Сохраненные посты
- `POST /posts/:id/save` — сохранить пост
- `DELETE /posts/:id/save` — удалить из сохраненных
- `GET /me/saved-posts?page&size` — список сохраненных

Поиск
- `GET /search/users?q&page&size` — поиск пользователей по `username/full_name`
- `GET /search/posts?q&page&size` — поиск постов по `caption`/`location`

Уведомления (pull)
- `GET /notifications?page&size` — список уведомлений
- `POST /notifications/:id/read` — прочитать
- `POST /notifications/read-all` — прочитать все

Жалобы (репорты)
- `POST /reports` — отправить жалобу (`target_type`, `target_id`, `reason`)

## API — Admin (`/api/admin/v1`)

Аутентификация и роли
- Админ-роуты защищены: `role = ADMIN`

CRUD пользователей
- `GET /users?page&size&is_banned&is_private` — список
- `GET /users/:id` — детальный просмотр
- `POST /users` — создать (админом)
- `PATCH /users/:id` — обновить
- `DELETE /users/:id` — удалить (редко, предпочтительнее бан)

Бан/разбан
- `POST /users/:id/ban` — бан с причиной
- `POST /users/:id/unban` — снять бан
- `GET /users/:id/ban-log` — история банов/разбанов

Контент и модерация
- `GET /posts?page&size&authorId&deleted` — список постов
- `DELETE /posts/:id` — удалить пост
- `GET /comments?page&size&postId&authorId` — список комментариев
- `DELETE /comments/:id` — удалить комментарий

Жалобы
- `GET /reports?page&size&status` — список жалоб
- `GET /reports/:id` — детализация
- `POST /reports/:id/resolve` — закрыть жалобу (resolved)
- `POST /reports/:id/reject` — отклонить жалобу

Метрики (простые)
- `GET /metrics` — агрегаты: количество пользователей, приватных профилей, забаненных, постов, комментариев, лайков, активных за 24ч, открытых жалоб

## Пагинация и фильтры

- Пагинация: `page` (1..N), `size` (по умолчанию 20, максимум 100)
- Сортировка: `sort=created_at:desc` (по умолчанию), допускаются поля `created_at`, `likes_count`
- Диапазоны: `from`, `to` (ISO8601), применимо к `posts`, `comments`
- Фильтры: `authorId`, `q` (поиск), `deleted` (для админки)

## Безопасность

- JWT c `access` (короткий TTL) и `refresh` (опционально, если решим добавить)
- Пароли: `bcrypt` с адекватной сложностью
- CORS, Helmet, Rate limiting (базово)
- Валидация входных данных (`zod` или `class-validator`)
- Проверка приватности при любом доступе к чужому контенту
- Ограничения загрузок: типы, размер, путь, сканирование имени

## Переменные окружения

- `DATABASE_URL` — строка подключения PostgreSQL
- `JWT_SECRET` — секрет для JWT
- `PORT` — порт сервера (по умолчанию 3000)
- `UPLOAD_DIR` — каталог для хранения изображений (по умолчанию `uploads`)

## План итераций

Итерация 1 — Подготовка окружения
- Инициализация проекта (TypeScript, tsconfig, ESLint, Prettier)
- Express-приложение, базовые middlewares (helmet, cors, morgan)
- Структура слоев и модулей (каркас файлов)

Итерация 2 — База данных и Prisma
- Добавление Prisma, настройка `DATABASE_URL`
- Описание `schema.prisma` по вышеуказанной модели
- Генерация клиента, миграции, базовые репозитории

Итерация 3 — Аутентификация
- Регистрация, логин, профайл `me`
- JWT, хэширование паролей, валидаторы DTO
- Обновление профиля, смена пароля

Итерация 4 — Загрузка медиа (локально)
- `multer` с `diskStorage`, валидация изображений
- `POST /media` и базовое удаление незакрепленных

Итерация 5 — Посты
- Создание/изменение/удаление/получение
- Привязка изображений к постам
- Фильтры и пагинация

Итерация 6 — Комментарии
- CRUD комментариев, ответы (parentId)
- Пагинация, мягкое удаление

Итерация 7 — Лайки
- Лайки для постов и комментариев
- Счетчики

Итерация 8 — Подписки и приватность
- Follow/Unfollow, заявки для приватных
- Одобрение/отклонение заявок
- Ограничение видимости контента

Итерация 9 — Лента и поиск
- Расчет ленты по подпискам, приватность
- Поиск пользователей и постов

Итерация 10 — Сторисы
- CRUD сторис, истечение
- Лента сторис

Итерация 11 — Сохраненные посты
- Добавление/удаление/список

Итерация 12 — Уведомления
- Генерация и выдача уведомлений (pull)
- Пометка прочитанных

Итерация 13 — Репорты
- Создание жалоб пользователями
- Просмотр и статусы

Итерация 14 — Admin API
- CRUD пользователей
- Бан/разбан, модерация постов/комментариев
- Просмотр жалоб

Итерация 15 — Метрики и финальные правки
- Агрегаты системы
- Рефакторинг, оптимизации, индексы

Итерация 16 — Тестирование и запуск
- Юнит/интеграционные тесты (Jest + Supertest)
- Скрипты запуска (`yarn dev`, `yarn build`, `yarn start`)

## Используемые зависимости (план)

- `express`, `cors`, `helmet`, `morgan`
- `multer` — загрузка файлов
- `bcrypt`, `jsonwebtoken`
- `prisma`, `@prisma/client`
- `zod` или `class-validator` — валидация
- Dev: `ts-node`, `typescript`, `jest`, `supertest`, `eslint`, `prettier`

## Примечания

- Мы используем четкие слои и классы, чтобы код был читаемым и расширяемым
- Все доступы к данным идут через репозитории, бизнес-правила — в сервисах
- В контроллерах минимальная логика — только HTTP-обработка, валидация и вызовы сервисов
- Приватность — системное правило: сервисы проверяют, имеет ли пользователь право видеть чужой контент

---

Готово. После подтверждения — перейдем к Итерации №1 (подготовка окружения).

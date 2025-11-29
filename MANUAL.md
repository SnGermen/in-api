# MANUAL: Backend проекта In API

## 1. Обзор проекта

- Цель: backend Instagram‑подобного приложения (посты, комментарии, лайки, подписки, сторис, медиа, уведомления, поиск, репорты, админ-действия).
- Архитектура: модульная `Express` + слои `controllers → services → repositories`, БД `PostgreSQL` через `Prisma ORM`, аутентификация `JWT`, валидация `express-validator`, загрузка файлов `multer`, логирование `pino`.
- Технологии: `TypeScript`, `Express 5`, `Prisma`, `PostgreSQL`, `swagger-jsdoc` + `swagger-ui-express`, `dotenv`, `bcrypt`, `jsonwebtoken`, `multer`, `pino`.
- API‑документация: проект использует Swagger (OpenAPI) — UI доступен по `GET /api-docs`, сырой JSON по `GET /docs.json`.

## 2. Структура проекта

- Корень:
  - `src/` — приложение
  - `prisma/` — схема БД и сидинг
  - `seed_assets/` — изображения для демо-данных
  - `uploads/` — загруженные/демо изображения (генерируется при запуске/сидинге)
  - `Dockerfile`, `docker-compose.yml`, `entrypoint.sh`
  - `.env.example` — пример окружения

- Модули backend (контроллеры/сервисы/репозитории): `src/modules/*`
  - Примеры:
    - `auth`: `src/modules/auth/AuthController.ts`, `AuthService.ts`, `AuthRepository.ts`
    - `posts`: `src/modules/posts/PostsController.ts`, `PostsService.ts`, `PostsRepository.ts`
    - `comments`: `src/modules/comments/CommentsController.ts`, `CommentsService.ts`, `CommentsRepository.ts`
    - `likes`: `src/modules/likes/LikesController.ts`, `LikesService.ts`, `LikesRepository.ts`
    - `follows`: `src/modules/follows/FollowsController.ts`, `FollowsService.ts`, `FollowsRepository.ts`
    - `stories`: `src/modules/stories/StoriesController.ts`, `StoriesService.ts`, `StoriesRepository.ts`
    - `media`: `src/modules/media/MediaController.ts`, `MediaService.ts`, `MediaRepository.ts`
    - `notifications`: `src/modules/notifications/NotificationsController.ts`, `NotificationsService.ts`, `NotificationsRepository.ts`
    - `search`: `src/modules/search/SearchController.ts`, `SearchService.ts`, `SearchRepository.ts`
    - `saves`: `src/modules/saves/SavesController.ts`, `SavesService.ts`, `SavesRepository.ts`
    - `tags`: `src/modules/tags/TagsController.ts`, `TagsService.ts`, `TagsRepository.ts`
    - `chats`: `src/modules/chats/ChatsController.ts`, `ChatsService.ts`, `ChatsRepository.ts`
    - `users`: `src/modules/users/UsersController.ts`, `UsersService.ts`, `UsersRepository.ts`
    - `admin`: `src/modules/admin/*` — админ-функции (пользователи, контент)
    - `reports`: `src/modules/reports/*` — пользовательские и админ-репорты

- Middleware:
  - Авторизация/роли/бан: `src/core/http/middlewares/auth.ts`
  - Ошибки/404: `src/core/http/middlewares/error.ts`
  - Загрузка изображений (multer): `src/middleware/upload.ts`
  - Валидация запросов: `src/core/http/validators/index.ts`

- Модели/DTO/схемы:
  - Prisma схема БД: `prisma/schema.prisma`
  - DTO (пример): `src/modules/auth/dto/AuthDTO.ts`
  - Валидация через `express-validator` в контроллерах

- Маршруты:
  - Пользовательские: `src/routes/index.ts` монтируются на `/api/v1`
  - Админские: `src/routes/admin.ts` монтируются на `/api/admin/v1`

- Миграции:
  - Генерируются Prisma в `prisma/migrations/` после запуска `yarn prisma:migrate`

- Генератор демо-данных:
  - Скрипт: `prisma/seed.ts`
  - Исходные изображения: `seed_assets/*.jpg`

- Тесты:
  - E2E: на текущий момент не реализованы в репозитории
  - Unit: на текущий момент не реализованы в репозитории

- Swagger‑конфиг:
  - Конфигурация: `src/config/swagger.ts`
  - YAML‑файлы: `src/swagger/*.yaml` (список собирается в `src/swagger/index.ts`)

- Docker:
  - `Dockerfile` — образ API (Node 20 Alpine)
  - `docker-compose.yml` — сервисы `db` (PostgreSQL) и `api`

## 3. Запуск проекта

### 3.1. Запуск через Docker

1) Поднять базу данных:

```bash
docker compose up -d db
```

2) Собрать и запустить API:

```bash
docker compose build api
docker compose up -d api
```

Альтернатива: запустить всё сразу в фоне:

```bash
docker compose up -d
```

- Сервисы:
  - `db`: PostgreSQL 16‑alpine, порт `5432`
  - `api`: Node 20 + TypeScript, порт контейнера `3000`, внешний порт — `${API_PORT:-3000}`
  - Swagger UI обслуживается самим `api` по `http://localhost:${API_PORT:-3000}/api-docs`
  - Сидинг демоданных встроен в `entrypoint.sh` и выполняется автоматически при старте `api`.

- Порядок запуска: сначала `db`, затем `api` (в `api` скрипт применит схему, сгенерирует клиент Prisma и выполнит сидинг).

- Проверка статуса:
  - Healthcheck: `GET http://localhost:${API_PORT:-3000}/api/v1/health`
  - Admin health: `GET http://localhost:${API_PORT:-3000}/api/admin/v1/health`
  - Логи: `docker compose logs -f api db`
  - Список контейнеров: `docker compose ps`

### 3.2. Локальный запуск (без Docker)

1) Подготовить окружение:

```bash
cp .env.example .env
# Обновите DATABASE_URL под вашу локальную базу Postgres
```

2) Установка зависимостей:

```bash
yarn install
```

3) Генерация Prisma клиента и миграции:

```bash
yarn prisma:generate
yarn prisma:migrate
```

4) Сидинг демоданных (по желанию):

```bash
yarn prisma:seed
```

5) Запуск dev‑сервера:

```bash
yarn dev
# Сервер слушает порт из .env (по умолчанию 3000)
```

Полезные проверки:

```bash
yarn lint
yarn typecheck
```

### 3.3. Генерация демоданных

- Команда запуска: `yarn prisma:seed`
- Как работает: копирует изображения из `seed_assets/` в `uploads/images/demo/`, создаёт пользователей (20 + 1 админ), посты, медиа, лайки, комментарии, подписки, сторис.
- Какие данные создаёт: пользователи, посты, комментарии, лайки, подписки, сторис, медиа; админ‑пользователя `username=admin`.
- Повторная пересборка данных: `yarn db:reset` (reset миграций, применение схемы, сидинг)
- Интеграция с миграциями: в Docker `entrypoint.sh` применяет схему (`prisma db push`) и затем выполняет сидинг.

## 4. Swagger документация

- Файлы: `src/swagger/*.yaml` (модули: `auth`, `users`, `posts`, `comments`, `stories`, `likes`, `admin`)
- Конфиг: `src/config/swagger.ts` — сборка `OpenAPI 3.0`, подключение `bearerAuth`, сервера `/api/v1` и `/api/admin/v1`.
- UI: `http://localhost:${PORT}/api-docs` (по умолчанию `http://localhost:3000/api-docs`)
- JSON: `http://localhost:${PORT}/docs.json`
- Обновление: правьте соответствующие `.yaml` файлы и перезапустите сервер (или пересоберите контейнер).
- Теги: `Auth`, `Users`, `Posts`, `Comments`, `Stories`, `Likes`, `Admin` и др.
- Схемы валидации: проверка полей происходит на уровне контроллеров через `express-validator`.

## 5. Документация по API

Базовые URL:

- Пользовательские: `http://localhost:${PORT}/api/v1` (по умолчанию `http://localhost:3000/api/v1`)
- Админские: `http://localhost:${PORT}/api/admin/v1`

Авторизация:

- Заголовок: `Authorization: Bearer <JWT>`
- Роли и проверки: `requireAuth`, `requireAdmin`, `requireNotBanned`

Ниже приведён список эндпоинтов, сгруппированный по разделам. Для краткости ответы показаны в типовом виде (200/201 с объектом или `{ success: true }`), подробные схемы — в Swagger UI.

### System

- `GET /health` — проверка статуса
- `GET /version` — текущая версия API

### Auth

- `POST /auth/register` — регистрация; body: `{ email, username, password }`; ответы: `201`, ошибки: `409 Email/Username in use`, `400` валидация
- `POST /auth/login` — логин; body: `{ identifier, password }`; ответы: `200`, ошибки: `401 Invalid credentials`
- `GET /auth/me` — текущий пользователь; требует `requireAuth`
- `PATCH /auth/me` — обновление профиля; body опционально `{ fullName, bio, isPrivate }`; `requireAuth`
- `PATCH /auth/password` — смена пароля; body `{ currentPassword, newPassword }`; `requireAuth`
- `PATCH /auth/me/avatar` — установить аватар; body `{ mediaId }`; `requireAuth` + `requireNotBanned`
- `DELETE /auth/me/avatar` — убрать аватар; `requireAuth` + `requireNotBanned`
- `GET /auth/check-username?username=...`
- `GET /auth/check-email?email=...`

Примеры:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"u@example.com","username":"user1","password":"password123"}'

curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"user1","password":"password123"}'
```

### Media

- `POST /media` — загрузка изображения (`multipart/form-data`, поле `file`); `requireAuth`
- `DELETE /media/{id}` — удалить медиа; `requireAuth`; ошибки: `403 Media in use`, `404 Not found`

Пример загрузки:

```bash
curl -X POST http://localhost:3000/api/v1/media \
  -H 'Authorization: Bearer <JWT>' \
  -F 'file=@./seed_assets/demo1.jpg'
```

### Posts

- `GET /posts` — список; query: `authorId, from, to, page, size, sort`
- `POST /posts` — создать; body: `{ caption?, mediaIds? }`; `requireAuth` + `requireNotBanned`
- `GET /posts/{id}` — получить пост
- `PATCH /posts/{id}` — обновить подпись; body `{ caption? }`; `requireAuth` + `requireNotBanned`
- `DELETE /posts/{id}` — удалить; `requireAuth` + `requireNotBanned`

### Comments

- `POST /posts/{id}/comments` — добавить; body `{ text, parentId? }`; `requireAuth` + `requireNotBanned`
- `GET /posts/{id}/comments` — список; query `page, size`
- `PATCH /comments/{id}` — обновить текст; body `{ text }`; `requireAuth` + `requireNotBanned`
- `DELETE /comments/{id}` — удалить; `requireAuth` + `requireNotBanned`

### Likes

- Посты: `POST /posts/{id}/likes`, `DELETE /posts/{id}/likes`, `GET /posts/{id}/likes` (query `page,size`)
- Комментарии: `POST /comments/{id}/likes`, `DELETE /comments/{id}/likes`, `GET /comments/{id}/likes` (query `page,size`)

### Follows

- `POST /users/{id}/follow` — подписаться; `requireAuth` + `requireNotBanned`; ошибки: `400 self`, `404 user`
- `DELETE /users/{id}/follow` — отписаться
- `GET /users/{id}/follow-status` — статус; `requireAuth`
- `GET /users/{id}/relationship` — взаимность; `requireAuth`
- `GET /users/{id}/followers|following|mutuals` — списки; query `page,size`
- `GET /me/follow-requests` — входящие (приватные аккаунты)
- `GET /me/follow-requests/outgoing` — исходящие
- `POST /follow-requests/{id}/approve|reject` — обработка; `requireAuth` + `requireNotBanned`
- `DELETE /me/followers/{id}` — убрать подписчика; `requireAuth` + `requireNotBanned`

### Feed

- `GET /feed` — лента; query `page,size,sort`; `requireAuth`

### Search

- `GET /search/users` — поиск пользователей; query `q,page,size`
- `GET /search/posts` — поиск постов, доступных пользователю; `requireAuth`

### Saves

- `POST /posts/{id}/save` — сохранить пост; `requireAuth` + `requireNotBanned`
- `DELETE /posts/{id}/save` — убрать из сохранённых
- `GET /me/saves` — список сохранённых; query `page,size,sort`; `requireAuth`

### Notifications

- `GET /me/notifications` — список; query `page,size`; `requireAuth`
- `GET /me/notifications/since?since=ISO&limit=N` — новые с момента; `requireAuth`
- `GET /me/notifications/unread-count` — счётчик непрочитанных; `requireAuth`
- `POST /notifications/{id}/read` — пометить прочитанным; `requireAuth`
- `POST /notifications/read-all` — прочитать всё; `requireAuth`

### Stories

- `POST /stories` — создать сторис; body `{ mediaIds: string[], expiresInHours? }`; `requireAuth` + `requireNotBanned`
- `GET /stories` — доступные сторис; `requireAuth`; query `page,size`
- `GET /users/{id}/stories` — сторис пользователя; `requireAuth`; query `page,size`
- `DELETE /stories/{id}` — удалить свою сторис; `requireAuth` + `requireNotBanned`

### Tags

- `GET /hashtags/trending?limit=N` — тренды
- `GET /hashtags/{tag}/posts` — публичные посты по тегу; query `page,size`
- `GET /me/hashtags/{tag}/posts` — доступные посты по тегу; `requireAuth`

### Users

- `GET /users/{id}` — профиль пользователя (частично доступен анонимно)

### Chats

- `POST /conversations` — начать диалог; body `{ userId }`; `requireAuth` + `requireNotBanned`
- `GET /conversations` — список диалогов; `requireAuth`; query `page,size`
- `POST /conversations/{id}/messages` — отправить; body `{ text }`; `requireAuth` + `requireNotBanned`
- `GET /conversations/{id}/messages` — сообщения; `requireAuth`; query `page,size`

### Reports (user)

- `POST /reports` — создать репорт; body `{ targetType: 'POST'|'COMMENT'|'USER', targetId, reason }`; `requireAuth` + `requireNotBanned`
- `GET /me/reports` — мои репорты; `requireAuth`; query `page,size`

### Admin (только `/api/admin/v1`, `requireAdmin`)

- Reports:
  - `GET /reports` — список (query `status,page,size`)
  - `POST /reports/{id}/status` — изменить статус репорта; body `{ status }`
- Users:
  - `POST /users/{id}/ban|unban` — бан/разбан; body `{ reason? }`
  - `GET /users/{id}/ban-log` — лог действий бана
- Content:
  - `POST /posts/{id}/hide|restore` — скрыть/восстановить пост
  - `POST /comments/{id}/hide|restore` — скрыть/восстановить комментарий

## 6. Troubleshooting

- Ошибки запуска:
  - `DATABASE_URL` пуст или неверен — проверьте `.env`, доступность Postgres
  - Порт занят — измените `PORT`/`API_PORT` или освободите порт
  - Нет seed‑ассетов — добавьте `.jpg` в `seed_assets/` (иначе сидер упадёт)

- Проблемы с Docker:
  - Контейнер `api` перезапускается — смотрите `docker compose logs -f api`, проверьте, что `db` доступна
  - Не применяются схемы — убедитесь, что сеть и `DATABASE_URL` внутри контейнера указывает на `db`

- Проблемы с миграциями:
  - `prisma migrate dev` не создаёт миграции — проверьте права, наличие изменений схемы
  - Сброс БД: `yarn db:reset` (dev), либо `docker compose down -v && docker compose up -d`

- Проблемы с сидингом:
  - Нет файлов в `seed_assets/` — сидер бросит ошибку; добавьте демо файлы
  - Повторный сидинг: используйте `yarn db:reset`

- Типичные ошибки API:
  - `401 Unauthorized` — отсутствует/невалидный `Authorization: Bearer <JWT>`
  - `403 Forbidden` — пользователь забанен (`requireNotBanned`) или нет прав
  - `404 Not Found` — сущность отсутствует или удалена
  - `409 Conflict` — конфликт состояний (пример: email/username заняты, медиа используется)

- Логи:
  - Локально: вывод `pino` (dev формат) в консоль
  - В Docker: `docker compose logs -f api db`

## 7. Шаги

1) Установите Docker и PostgreSQL (или используйте локальный Postgres)
2) Создайте `.env` из `.env.example` и проверьте `DATABASE_URL`
3) Запустите через Docker: `docker compose up -d` и проверьте `GET /api/v1/health`
4) Откройте Swagger UI: `http://localhost:3000/api-docs`
5) Авторизуйтесь: зарегистрируйте пользователя, залогиньтесь, используйте `Authorization: Bearer <JWT>`
6) Загрузите медиа (`/media`), создайте пост, добавьте комментарий — всё видно в Swagger

## 8. Полезные команды

```bash
# Установка, проверки
yarn install
yarn lint
yarn typecheck

# Prisma и БД
yarn prisma:generate
yarn prisma:migrate
yarn prisma:seed
yarn db:reset

# Dev сервер
yarn dev

# Docker
docker compose up -d db
docker compose build api && docker compose up -d api
docker compose logs -f api
docker compose down -v
```

# Swagger API документация

## План
- Использовать `swagger-jsdoc` для генерации спецификации OpenAPI
- Использовать `swagger-ui-express` для отображения UI
- Создать конфиг: `src/config/swagger.ts`
- Документировать API на основе YAML файлов
- Разделить документацию по модулям: `auth`, `posts`, `comments`, `stories`, `likes`, `users`, `admin`
- Каждому модулю — собственный swagger-файл в `src/swagger`

## Структура
```
/src/swagger/
  auth.yaml
  users.yaml
  posts.yaml
  comments.yaml
  stories.yaml
  likes.yaml
  admin.yaml
  index.ts
```

## Настройка сервера
- Подключить Swagger:
  - `GET /api-docs` — Swagger UI
  - `GET /docs.json` — raw спецификация
- Реализация в `src/server.ts`

## Генерация примеров
- Для каждого модуля добавить минимальный пример (endpoint, тег, описание, базовые схемы)
- Пример для `auth`:
```
/auth/login:
  post:
    summary: Login user
    tags:
      - Auth
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/LoginRequest'
    responses:
      '200':
        description: OK
```

## Дальше
- После генерации файлов можно интегрировать описания в существующие endpoints автоматически. Сообщи, включить ли это сейчас.

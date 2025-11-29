# Базовый скелет TypeScript + Express + PostgreSQL

Цель: подготовить инфраструктуру проекта без бизнес-логики. Все команды выполняются в корне проекта. Пакетный менеджер: `yarn`.

## 1. Инициализация проекта
- Инициализация:
  ```bash
  yarn init -y
  ```
- Установка обязательных зависимостей:
  ```bash
  yarn add express cors multer dotenv bcrypt jsonwebtoken express-validator pino @prisma/client
  ```
- Установка dev-зависимостей:
  ```bash
  yarn add -D typescript ts-node-dev prisma eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-import prettier @types/node @types/express @types/cors @types/multer @types/jsonwebtoken @types/bcrypt
  ```
- Базовая структура папок:
  - `src/`
  - `src/config/`
  - `src/utils/`
  - `src/middleware/`
  - `uploads/images/`

## 2. Настройка конфигурации
- Создать и настроить файлы:
  - `tsconfig.json`
  - `.editorconfig`
  - `.gitignore`
  - `.env.example`
  - `src/config/env.ts`

## 3. Docker
- Создать:
  - `docker-compose.yml` c сервисом PostgreSQL
  - `Dockerfile` для API
  - каталог `docker/` при необходимости
- Команды запуска:
  ```bash
  # запуск базы данных
  docker compose up -d db

  # сборка и запуск API (локально)
  yarn dev

  # сборка и запуск API в Docker
  docker compose up -d api
  ```

## 4. Установка зависимостей
- Обязательные: `express`, `typescript`, `ts-node-dev`, `cors`, `multer`, `dotenv`, `bcrypt`, `jsonwebtoken`, `express-validator`
- Dev: `eslint` + плагины, `prettier`, `ts-node-dev`, типы для `express` и др.

## 5. Настройка Prisma
- Выбор: Prisma.
- Базовая конфигурация:
  - `prisma/schema.prisma` с провайдером `postgresql`
  - `src/config/prisma.ts` для клиента
  - переменная окружения `DATABASE_URL`
- Команды:
  ```bash
  # генерация клиента
  yarn prisma generate
  ```

## 6. Логгер
- Использовать `pino`.
- Файл: `src/utils/logger.ts`.

## 7. Статическая раздача и загрузки
- Архитектура хранения изображений: `uploads/images/<userId>/<timestamp>.jpg`
- Настроить `express.static` на `/uploads`.
- Middleware `src/middleware/upload.ts` на базе `multer`.

## 8. Финальный шаг
- Проверки:
  ```bash
  yarn lint
  yarn typecheck
  ```
- Вопрос: «Окружение готово. Переходим к промпту архитектуры?»
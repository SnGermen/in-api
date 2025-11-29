FROM node:20-alpine AS base

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production=false

COPY tsconfig.json .
COPY prisma ./prisma
COPY src ./src
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
COPY tsconfig.seed.json ./tsconfig.seed.json

RUN yarn prisma:generate && yarn build && yarn tsc -p tsconfig.seed.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]

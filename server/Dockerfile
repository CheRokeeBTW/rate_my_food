FROM node:20-bookworm-slim AS base

WORKDIR /app

FROM base AS deps

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

FROM deps AS build

COPY . .

RUN npx prisma generate
RUN npm run build

FROM build AS production-deps

RUN npm prune --omit=dev --ignore-scripts

FROM base AS production

ENV NODE_ENV=production

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

USER node

EXPOSE 3001

CMD ["node", "dist/src/main.js"]

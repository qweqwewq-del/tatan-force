FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:all

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/migrations ./server/migrations
RUN mkdir -p /app/server/uploads && chown -R node:node /app
USER node
EXPOSE 4174
CMD ["sh", "-c", "node server/dist/scripts/migrate.js && node server/dist/scripts/seed.js && node server/dist/index.js"]

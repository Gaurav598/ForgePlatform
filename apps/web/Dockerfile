# FORGE AI — Next.js Frontend Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 forgeai && \
    adduser --system --uid 1001 forgeai
COPY --from=builder /app/public ./public
COPY --from=builder --chown=forgeai:forgeai /app/.next/standalone ./
COPY --from=builder --chown=forgeai:forgeai /app/.next/static ./.next/static
USER forgeai
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]

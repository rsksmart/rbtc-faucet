# Use a lighter Node.js Alpine image
FROM node:25-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Declare build args for NEXT_PUBLIC_* vars (inlined at build time by Next.js)
ARG NEXT_PUBLIC_SITE_KEY_CAPTCHA
ARG NEXT_PUBLIC_TAG_MANAGER_ID

# Set them as env vars so Next.js picks them up during build
ENV NEXT_PUBLIC_SITE_KEY_CAPTCHA=$NEXT_PUBLIC_SITE_KEY_CAPTCHA
ENV NEXT_PUBLIC_TAG_MANAGER_ID=$NEXT_PUBLIC_TAG_MANAGER_ID

COPY package.json package-lock.json ./
COPY .env.example ./.env
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create tmp directory for temporary storage with proper permissions
RUN mkdir -p /app/tmp && chown -R nextjs:nodejs /app/tmp

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
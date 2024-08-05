FROM node:18-alpine

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

WORKDIR /app

USER nextjs

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

EXPOSE 3000

ENV PORT=3000

CMD HOSTNAME="0.0.0.0" npm run start
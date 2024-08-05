FROM node:18-alpine

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

WORKDIR /app

USER nextjs

COPY package.json package-lock.json* ./

RUN npm install

EXPOSE 3000

ENV PORT=3000

CMD HOSTNAME="0.0.0.0" npm run start
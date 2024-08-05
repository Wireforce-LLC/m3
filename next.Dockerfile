FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

EXPOSE 3000

ENV PORT=3000

CMD HOSTNAME="0.0.0.0" npm run start
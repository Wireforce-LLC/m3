FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
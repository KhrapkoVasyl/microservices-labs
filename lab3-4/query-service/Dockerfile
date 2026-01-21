FROM node:20-alpine

WORKDIR /app

COPY query-service/package*.json ./
COPY query-service/nest-cli.json ./
COPY query-service/tsconfig.json ./
RUN npm install

COPY query-service/src ./src

RUN npm run build

EXPOSE 8001

CMD ["node", "dist/main.js"]

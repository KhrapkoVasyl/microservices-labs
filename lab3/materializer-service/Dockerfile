FROM node:20-alpine

WORKDIR /app

COPY materializer-service/package*.json ./
COPY materializer-service/nest-cli.json ./
COPY materializer-service/tsconfig.json ./
RUN npm install

COPY common ../common
COPY materializer-service/src ./src

RUN npm run build

CMD ["node", "dist/main.js"]

FROM node:20-alpine

WORKDIR /app

COPY compute-service/package*.json ./
COPY compute-service/nest-cli.json ./
COPY compute-service/tsconfig.json ./
RUN npm install

COPY compute-service/src ./src

RUN npm run build

CMD ["node", "dist/main.js"]

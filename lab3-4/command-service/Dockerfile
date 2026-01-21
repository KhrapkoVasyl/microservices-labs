FROM node:20-alpine

WORKDIR /app

COPY command-service/package*.json ./
COPY command-service/nest-cli.json ./
COPY command-service/tsconfig.json ./
RUN npm install

COPY command-service/src ./src

RUN npm run build

EXPOSE 8000

CMD ["node", "dist/main.js"]

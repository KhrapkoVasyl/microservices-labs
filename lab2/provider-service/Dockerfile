FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json ./

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main.js"]

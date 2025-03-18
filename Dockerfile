FROM node:19.8.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "npm run dev -- --port $PORT"]

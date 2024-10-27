FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

ARG PORT
EXPOSE $PORT

CMD ["npm", "start"]
FROM node:20-alpine AS build1

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

RUN npm install -g serve

FROM build1 as build2

COPY --from=build1 /app/build/index.html /app/build/200.html

EXPOSE 80
EXPOSE 443

CMD ["serve", "-s", "/app/build", "-p", "80"]
FROM node:21-alpine:3.18
WORKDIR /frontend
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
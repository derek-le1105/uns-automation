FROM node:21-alpine3.18 as build
WORKDIR /frontend
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5175
CMD ["npm", "start"]
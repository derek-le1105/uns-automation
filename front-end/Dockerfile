FROM node:21-alpine3.18 as build
WORKDIR /frontend
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "start"]
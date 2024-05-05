#Stage 1: Install
FROM node:21-alpine as base
WORKDIR /base
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

#Stage 2: Build
FROM base AS build
ENV NODE_ENV=production
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
WORKDIR /build
ENV NODE_ENV=production
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY  
COPY --from=base /base ./
RUN npm run build

#Stage 3: app
FROM base AS app
ENV NODE_ENV=production
WORKDIR /frontend
ENV NODE_ENV=production
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY  
COPY --from=build /build/package*.json ./
COPY --from=build /build/node_modules ./node_modules/
COPY --from=build /build/public ./public/

EXPOSE 5175
CMD ["npm", "start"]

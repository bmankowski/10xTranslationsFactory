FROM node:lts-slim
WORKDIR /app
COPY package*.json ./
# Install dependencies and update Astro
RUN npm ci
EXPOSE 3000

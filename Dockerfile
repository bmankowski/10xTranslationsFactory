FROM node:lts-slim
WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm ci

EXPOSE 3000

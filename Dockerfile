FROM node:lts-slim
WORKDIR /app
COPY package*.json ./

# Install dependencies, Supabase CLI, and update Astro
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://get.pnpm.io/install.sh | bash - && \
    export PNPM_HOME="/root/.local/share/pnpm" && \
    export PATH="$PNPM_HOME:$PATH" && \
    pnpm add -g supabase && \
    npm ci

EXPOSE 3000

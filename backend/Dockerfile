# --- STAGE 1: Builder ---
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# On ignore les scripts de build natifs (esbuild n'est pas nécessaire pour faire tourner l'API Express)
RUN pnpm install --ignore-scripts

COPY . .

# --- STAGE 2: Runtime ---
FROM node:24-alpine AS runtime
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Installation uniquement des dépendances de prod en ignorant les scripts
RUN pnpm install --prod --ignore-scripts

COPY --from=builder /app/src ./src

USER node

EXPOSE 5000

CMD ["node", "src/index.js"]
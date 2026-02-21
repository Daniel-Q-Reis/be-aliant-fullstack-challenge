# ── Estágio 1: Builder ──────────────────────────────────────────────────────
# Contexto de build deve ser a RAIZ do monorepo (não worker/)
# No docker-compose: context: . | dockerfile: worker/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY worker/package.json ./worker/
COPY common/package.json ./common/

RUN npm install --workspaces --include-workspace-root

COPY common/ ./common/
COPY worker/ ./worker/

WORKDIR /app/worker
RUN npm run build

# ── Estágio 2: Production ────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/worker/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/worker/package.json ./package.json

# Worker não expõe porta HTTP — é um processo background de consumo de fila
CMD ["node", "dist/main"]

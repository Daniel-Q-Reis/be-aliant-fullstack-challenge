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

# O npm workspace cria um symlink: node_modules/@be-aliant/common → /app/common
# O tsc compilou common/src/*.ts → worker/dist/common/src/*.js
# Copiamos o JS compilado para que o symlink resolva corretamente em runtime
COPY --from=builder /app/worker/dist/common/src ./common/src
COPY --from=builder /app/common/package.json ./common/package.json

# Worker não expõe porta HTTP — é um processo background de consumo de fila
# O tsc compila com ancestral comum em /app, então main.js fica em dist/worker/src/
CMD ["node", "dist/worker/src/main"]

# ── Estágio 1: Builder ──────────────────────────────────────────────────────
# Contexto de build deve ser a RAIZ do monorepo (não api/)
# No docker-compose: context: . | dockerfile: api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os manifestos de dependência de todo o workspace antes do npm install
# para aproveitar o cache de camadas do Docker
COPY package*.json ./
COPY api/package.json ./api/
COPY common/package.json ./common/

# Instala todas as dependências do workspace (hoisting automático pelo npm)
RUN npm install --workspaces --include-workspace-root

# Copia o código-fonte dos pacotes necessários para o build
COPY common/ ./common/
COPY api/ ./api/

# Compila a API para JavaScript (dist/)
WORKDIR /app/api
RUN npm run build

# ── Estágio 2: Production ────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas os artefatos necessários do estágio builder
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/api/package.json ./package.json

# O npm workspace cria um symlink: node_modules/@be-aliant/common → /app/common
# O tsc compilou common/src/*.ts → api/dist/common/src/*.js
# Copiamos o JS compilado para que o symlink resolva corretamente em runtime
COPY --from=builder /app/api/dist/common/src ./common/src
COPY --from=builder /app/common/package.json ./common/package.json

EXPOSE 3000

# O tsc compila com ancestral comum em /app, então main.js fica em dist/api/src/
CMD ["node", "dist/api/src/main"]

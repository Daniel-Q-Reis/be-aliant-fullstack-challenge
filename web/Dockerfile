# ── Estágio 1: Builder ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Estágio 2: Production – Nginx para servir a SPA ─────────────────────────
FROM nginx:alpine AS production

# Copia o build gerado pelo Vite para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração personalizada para suportar HTML5 History Mode do Vue Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

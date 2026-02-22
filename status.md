# Status do Projeto – be-aliant-challenge

## Branch Atual: `feature/polish-and-tests`
## Próxima Branch: Nenhuma — ENTREGA FINAL

---

## Histórico de Fases

### ✅ Fase 0 – Infraestrutura (`feature/infra-setup`) – concluída
**Arquivos criados:** `docker-compose.yml`, `.env.example`, `struct.md`, `status.md`

---

### ✅ Fase 1 – Backend Base + Auth (`feature/api-auth-users`) – concluída
**Entregues:**
- `package.json` raiz (npm workspaces: api, worker, common)
- `common/` – entidades TypeORM e DTOs compartilhados
- `api/` – NestJS completo:
  - ConfigModule com validação Joi (app não sobe com envs faltando)
  - TypeOrmModule async via ConfigService (`synchronize: true` com aviso)
  - GlobalExceptionFilter, LoggingInterceptor, `@CurrentUser` decorator
  - **UsersModule**: `POST /users` (bcrypt hash) + `PUT /users/:id`
  - **AuthModule**: `POST /login` (JWT HS256) + `JwtAuthGuard` exportado
  - **Testes unitários**: 7 casos (4 UsersService + 3 AuthService)
  - Dockerfile multi-stage (builder + production)

---

### ✅ Fase 2 – Pedidos + Mensageria (`feature/api-orders-messaging`) – concluída
**Entregues:**
- `OrderEntity` (`decimal(10,2)`, `enum OrderStatus` exportado separadamente)
- `OrdersModule`: `POST /orders`, `GET /orders?status=`, `GET /orders/:id` (todos protegidos por JWT, userId do token)
- `MessagingModule` isolado (`@Global`, AWS SDK v3 `latest`)
- `SqsProducerService`: endpoint configurável (LocalStack ↔ SQS real), try/catch com log
- Outbox Pattern documentado em código (comentário obrigatório em OrdersService)
- **Testes unitários:** 2 OrdersService + 2 SqsProducerService (mock do SDK)
- AppModule atualizado: `OrderEntity` no TypeORM, Joi com vars AWS/SQS

---

### ✅ Fase 3 – Worker SQS Consumer (`feature/worker-consumer`) – concluída
**Entregues:**
- NestJS Standalone: `createApplicationContext()` — sem HTTP server
- `Dockerfile` multi-stage sem `EXPOSE` (processo background puro)
- `ConsumerService`:
  - Fail-safe loop infinito com `setImmediate` (não bloqueia o init do módulo)
  - Long Polling: `WaitTimeSeconds: 20` (reduz calls vazias e custo SQS)
  - `sleep()` auxiliar para intervalo configurável (`SQS_POLL_INTERVAL_MS`)
  - UPDATE condicional: `{ id, status: PENDENTE }` → garante idempotência contra redelivery e réplicas
  - `DeleteMessage` resiliente: chamado em `affected:1` e `affected:0`; **suprimido** se DB lançar exceção
  - Comentário arquitetural obrigatório em PT-BR explicando a estratégia de idempotência
- `AppModule`: `synchronize: false` com comentário explícito (schema gerenciado pela API)
- **Testes unitários:** 3 casos cobrindo os 3 cenários de idempotência:
  - `affected: 1` → DeleteMessage ✅ chamado
  - `affected: 0` → DeleteMessage ✅ chamado (descarte idempotente)
  - Exceção de DB → DeleteMessage ❌ não chamado (mensagem retorna pela VisibilityTimeout)

---

### ✅ Fase 4 – Frontend Vue 3 (`feature/vue-frontend`) – concluída
**Entregues:**
- Vite + Vue 3 + TypeScript + Tailwind CSS (tema dark, design premium)
- `Dockerfile` multi-stage: builder (Vite) + production (nginx:alpine)
- `nginx.conf`: `try_files` SPA fallback + cache de assets estáticos + `server_tokens off`
- `services/api.ts`: Axios com interceptors de JWT inject e redirect em 401/403
- `stores/auth.ts` (Pinia): token persistido no localStorage, getter `isAuthenticated`, actions `login`/`logout`
- `stores/orders.ts` (Pinia): state `orders[]`, `currentOrder`, `loading`, `error` + 3 actions com try/catch
- `router/index.ts`: 4 rotas + `beforeEach` guard usando `isAuthenticated`
- **Views:**
  - `LoginView.vue`: form, spinner, exibição de erro, redirect
  - `DashboardView.vue`: tabela com filtros de status (pill buttons), badge PENDENTE/PROCESSADO
  - `CreateOrderView.vue`: form desc+valor (step=0.01), spinner, redirect
  - `OrderDetailView.vue`: badge colorido (amber=PENDENTE, emerald=PROCESSADO), grid de campos
- `App.vue`: navbar condicional ao `isAuthenticated`, links + botão Logout
- `docker-compose.yml` já continha o serviço `web` — nenhuma alteração necessária

---

### ✅ Fase 5 – Polish & Entrega Final (`feature/polish-and-tests`) – concluída
**Entregues:**
- **CI/CD** (`.github/workflows/ci.yml`): 3 jobs paralelos — `test-api`, `test-worker`, `build-web`
  - Corrigido para monorepo: `npm ci` na raiz + workspace commands (não há package-lock em api/ ou worker/)
- **Seed script** (`api/src/database/seed.ts`):
  - `DataSource` TypeORM standalone (sem NestJS bootstrap)
  - Hash bcrypt (salt 10) na senha do usuário admin
  - 3 pedidos de demonstração: 2 PENDENTE + 1 PROCESSADO
  - Executado no container: `docker-compose exec api node dist/api/src/database/seed.js`
- **Coleção Postman** (`be-aliant.postman_collection.json`): variáveis `baseUrl`/`token`/`orderId`, post-request script auto-salva token no `/login`
- **README.md** completo: badges CI/Node/NestJS/Vue/Docker/TS, diagrama Mermaid, tabela monorepo, justificativas arquiteturais, visão de produção

**PROJETO FINALIZADO E PRONTO PARA ENTREGA.**

# Status do Projeto – be-aliant-challenge

## Branch Atual: `feature/api-orders-messaging`
## Próxima Branch: `feature/worker-consumer`

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

### ⏳ Fase 3 – Worker SQS Consumer (`feature/worker-consumer`) – pendente
Previsto: NestJS Standalone, long polling SQS, UPDATE condicional (idempotência), fail-safe loop

---

### ⏳ Fase 4 – Frontend Vue 3 (`feature/vue-frontend`) – pendente

---

### ⏳ Fase 5 – Polish & Entrega Final (`feature/polish-and-tests`) – pendente

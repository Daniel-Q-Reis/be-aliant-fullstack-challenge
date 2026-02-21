# Status do Projeto – be-aliant-challenge

## Branch Atual: `feature/api-auth-users`
## Próxima Branch: `feature/api-orders-messaging`

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

### ⏳ Fase 2 – Pedidos + Mensageria (`feature/api-orders-messaging`) – pendente

Previsto:
- Order entity em `common/src/entities/`
- MessagingModule isolado (SqsProducerService)
- Módulo Orders: `POST /orders`, `GET /orders?status=`, `GET /orders/:id`
- Testes: `orders.service.spec.ts`, `sqs-producer.service.spec.ts`

---

### ⏳ Fase 3 – Worker SQS Consumer (`feature/worker-consumer`) – pendente

---

### ⏳ Fase 4 – Frontend Vue 3 (`feature/vue-frontend`) – pendente

---

### ⏳ Fase 5 – Polish & Entrega Final (`feature/polish-and-tests`) – pendente

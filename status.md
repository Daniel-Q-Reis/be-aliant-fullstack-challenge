# Status do Projeto – be-aliant-challenge

## Branch Atual: `feature/infra-setup`
## Próxima Branch: `feature/api-auth-users`

---

## Histórico de Fases

### ✅ Fase 0 – Infraestrutura (`feature/infra-setup`)

**Arquivos criados:**
- `docker-compose.yml` – Orquestra MySQL 8, Adminer, LocalStack SQS e sqs-init
- `.env.example` – Template de variáveis de ambiente (DB, JWT, AWS/SQS)
- `struct.md` – Árvore de diretórios com descrição de cada arquivo/pasta
- `status.md` – Este arquivo

**Serviços disponíveis após `docker-compose up --build`:**

| Serviço    | URL                       |
|------------|---------------------------|
| API REST   | http://localhost:3000     |
| Frontend   | http://localhost:5173     |
| Adminer    | http://localhost:8080     |
| LocalStack | http://localhost:4566     |

---

### ⏳ Fase 1 – Backend Base + Auth + Segurança (`feature/api-auth-users`) – pendente

Previsto:
- NestJS init + TypeORM + ConfigModule (validação Joi) + ValidationPipe global
- GlobalExceptionFilter + LoggingInterceptor + Pino
- Módulo Users: `POST /users`, `PUT /users/:id`
- Módulo Auth: `POST /login` (JWT)
- Testes unitários: `users.service.spec.ts`, `auth.service.spec.ts`

---

### ⏳ Fase 2 – Pedidos + Mensageria (`feature/api-orders-messaging`) – pendente

Previsto:
- MessagingModule isolado (SqsProducerService injetável)
- Módulo Orders: `POST /orders`, `GET /orders?status=`, `GET /orders/:id`
- Testes unitários: `orders.service.spec.ts`, `sqs-producer.service.spec.ts`

---

### ⏳ Fase 3 – Worker SQS Consumer (`feature/worker-consumer`) – pendente

Previsto:
- NestJS Standalone (`createApplicationContext`) sem HTTP server
- Poll loop fail-safe + idempotência via UPDATE condicional
- Log estruturado (Pino) em todos os eventos

---

### ⏳ Fase 4 – Frontend Vue 3 (`feature/vue-frontend`) – pendente

Previsto:
- Vue 3 + Vite + Pinia (`authStore`, `ordersStore`)
- Vue Router com guard `beforeEach`
- Views: Login, OrdersList, CreateOrder, OrderDetail
- Axios interceptors + TailwindCSS

---

### ⏳ Fase 5 – Polish & Entrega Final (`feature/polish-and-tests`) – pendente

Previsto:
- README.md completo (como rodar + decisões + diagrama Mermaid + produção)
- `npm run test:cov` em `api/` e `worker/`
- TypeORM migrations geradas
- Merge final para `main`

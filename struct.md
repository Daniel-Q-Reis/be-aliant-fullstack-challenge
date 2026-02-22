# Estrutura do Projeto – be-aliant-challenge

> Atualizada ao final de cada fase de desenvolvimento.

```
be-aliant-challenge/
│
├── package.json            # Raiz do monorepo – npm workspaces (api, worker, common)
├── docker-compose.yml      # MySQL 8, Adminer, LocalStack SQS, sqs-init, api, worker, web
├── .env.example            # Template de variáveis de ambiente (hostnames Docker corrigidos)
├── README.md               # Documenção completa (badges, Mermaid, justificativas)
├── be-aliant.postman_collection.json  # Coleção Postman v2.1 (auto-token no /login)
├── IMPLEMENTATION_PLAN_BEALIANT.md
├── struct.md               # Este arquivo
├── status.md               # Histórico de fases
├── .github/
│   └── workflows/
│       └── ci.yml              # CI: 3 jobs paralelos (test-api, test-worker, build-web)
│
├── common/                 # Pacote @be-aliant/common
│   ├── package.json
│   └── src/
│       ├── entities/
│       │   ├── user.entity.ts         # @Exclude no password, UUID
│       │   └── order.entity.ts        # OrderStatus enum, decimal(10,2), enum status
│       ├── dtos/
│       │   ├── create-user.dto.ts
│       │   ├── update-user.dto.ts     # PartialType
│       │   ├── login.dto.ts
│       │   ├── create-order.dto.ts    # userId NÃO está aqui (vem do JWT)
│       │   └── order-filter.dto.ts    # status opcional (IsEnum OrderStatus)
│       └── index.ts                   # Barrel de exports
│
├── api/                    # NestJS Monolito Modular
│   ├── package.json        # + @aws-sdk/client-sqs: latest
│   ├── tsconfig.json / tsconfig.build.json / nest-cli.json / .eslintrc.js / .prettierrc
│   ├── Dockerfile          # Multi-stage, contexto: raiz do monorepo
│   └── src/
│       ├── main.ts         # CORS, ValidationPipe, GlobalFilter, ClassSerializer
│       ├── app.module.ts   # ConfigModule (Joi completo), TypeORM (User+Order), todos os módulos
│       ├── common/
│       │   ├── filters/http-exception.filter.ts
│       │   ├── interceptors/logging.interceptor.ts
│       │   └── decorators/current-user.decorator.ts
│       └── modules/
│           ├── users/
│           │   ├── users.module.ts / controller / service / service.spec.ts (4 testes)
│           ├── auth/
│           │   ├── auth.module.ts / controller / service / service.spec.ts (3 testes)
│           │   ├── jwt.strategy.ts / jwt-auth.guard.ts
│           ├── messaging/                          ← Módulo isolado SQS (exigência do teste)
│           │   ├── messaging.module.ts             # @Global()
│           │   ├── sqs-producer.service.ts         # AWS SDK v3, endpoint configurável
│           │   └── sqs-producer.service.spec.ts    # mock do SDK (2 testes)
│           └── orders/
│               ├── orders.module.ts
│               ├── orders.controller.ts            # POST /orders, GET /orders, GET /orders/:id
│               ├── orders.service.ts               # Outbox Pattern documentado
│               └── orders.service.spec.ts          # 4 testes
│       └── database/
│           └── seed.ts                             # Seed standalone (DataSource direto, bcrypt, 3 pedidos demo)
│
├── worker/                 # NestJS Standalone – SQS Consumer (Fase 3)
│   ├── package.json        # Deps mínimas + AWS SDK v3 latest
│   ├── tsconfig.json / tsconfig.build.json / nest-cli.json
│   ├── Dockerfile          # Multi-stage, sem EXPOSE (background process)
│   └── src/
│       ├── main.ts         # createApplicationContext() – sem HTTP server
│       ├── app.module.ts   # ConfigModule (Joi) + TypeORM (synchronize:false) + ConsumerModule
│       └── consumer/
│           ├── consumer.module.ts
│           ├── consumer.service.ts    # Long polling (WaitTimeSeconds:20), UPDATE condicional,
│           │                          # fail-safe loop infinito (setImmediate), sleep() auxiliar
│           └── consumer.service.spec.ts  # 3 testes: affected:1→delete, affected:0→delete, exception→NÃO delete
│
├── web/                    # Vue 3 SPA (Fase 4)
│   ├── package.json        # Vite + Vue3 + Pinia + Axios + Tailwind
│   ├── vite.config.ts      # Porta 5173, alias @/src
│   ├── tailwind.config.js / postcss.config.js
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── index.html          # HTML raiz com div#app
│   ├── .env.example        # VITE_API_URL=http://localhost:3000
│   ├── Dockerfile          # Multi-stage: Vite build + Nginx:alpine
│   ├── nginx.conf          # try_files SPA fallback + cache de assets
│   └── src/
│       ├── main.ts             # Bootstrap: Pinia + Router + mount
│       ├── style.css           # @tailwind base/components/utilities
│       ├── App.vue             # Navbar condicional (auth), RouterView
│       ├── services/
│       │   └── api.ts             # Axios + interceptors JWT inject + 401/403 redirect
│       ├── stores/
│       │   ├── auth.ts            # Pinia: token localStorage, isAuthenticated getter
│       │   └── orders.ts          # Pinia: fetchOrders/fetchOrderById/createOrder
│       ├── router/
│       │   └── index.ts           # 4 rotas + beforeEach auth guard
│       └── views/
│           ├── LoginView.vue      # Form e-mail/senha, erro, spinner
│           ├── DashboardView.vue  # Tabela de pedidos + filtros PENDENTE/PROCESSADO
│           ├── CreateOrderView.vue # Form desc+valor, redirect ao sucesso
│           └── OrderDetailView.vue # Badge status amarelo/verde, grid de campos
└── docs/
    └── architecture.png    # (a gerar na Fase 5)
```

## Serviços após `docker-compose up --build`

| Serviço    | URL                       |
|------------|---------------------------|
| API REST   | http://localhost:3000     |
| Frontend   | http://localhost:5173     |
| Adminer    | http://localhost:8080     |
| LocalStack | http://localhost:4566     |

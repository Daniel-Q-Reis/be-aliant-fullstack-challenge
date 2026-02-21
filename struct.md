# Estrutura do Projeto – be-aliant-challenge

> Atualizada ao final de cada fase de desenvolvimento.

```
be-aliant-challenge/
│
├── package.json            # Raiz do monorepo – npm workspaces (api, worker, common)
├── docker-compose.yml      # MySQL 8, Adminer, LocalStack SQS, sqs-init, api, worker, web
├── .env.example            # Template de variáveis de ambiente
├── IMPLEMENTATION_PLAN_BEALIANT.md
├── README.md
├── struct.md               # Este arquivo
├── status.md               # Histórico de fases
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
│
├── worker/                 # (a ser criado na Fase 3 – feature/worker-consumer)
│   └── src/
│       ├── main.ts         # createApplicationContext()
│       └── order-processor/
│
├── web/                    # (a ser criado na Fase 4 – feature/vue-frontend)
│
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

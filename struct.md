# Estrutura do Projeto – be-aliant-challenge

> Árvore de diretórios com o estado atual do repositório.
> Atualizada ao final de cada fase de desenvolvimento.

```
be-aliant-challenge/
│
├── docker-compose.yml      # Orquestra todos os serviços locais:
│                           # MySQL 8, Adminer, LocalStack (SQS) e sqs-init
│
├── .env.example            # Template de variáveis de ambiente (copiar para .env)
│                           # Contém: DB, JWT, AWS/SQS e configurações do Worker
│
├── struct.md               # Este arquivo – árvore e descrição da estrutura
│
├── status.md               # Histórico de fases, branch atual e próximos passos
│
├── IMPLEMENTATION_PLAN_BEALIANT.md  # Plano arquitetural completo do projeto
│
├── README.md               # Como rodar, decisões técnicas e diagrama (a expandir)
│
├── common/                 # (a ser criado nas próximas fases)
│   │                       # Entidades e DTOs compartilhados entre api/ e worker/
│   ├── entities/           # User, Order (TypeORM entities)
│   └── dto/                # DTOs reutilizáveis
│
├── api/                    # (a ser criado na Fase 1 – feature/api-auth-users)
│   │                       # NestJS Monolito Modular – REST API
│   └── src/
│       ├── modules/
│       │   ├── auth/       # POST /login · JwtStrategy · JwtAuthGuard
│       │   ├── users/      # POST /users · PUT /users/:id
│       │   ├── orders/     # POST /orders · GET /orders · GET /orders/:id
│       │   └── messaging/  # Módulo isolado SQS (SqsProducerService)
│       ├── common/
│       │   ├── filters/    # GlobalExceptionFilter
│       │   ├── interceptors/ # LoggingInterceptor
│       │   └── decorators/ # @CurrentUser()
│       └── main.ts         # Bootstrap · CORS · ValidationPipe · Pino
│
├── worker/                 # (a ser criado na Fase 3 – feature/worker-consumer)
│   │                       # NestJS Standalone – SQS Consumer (sem HTTP server)
│   └── src/
│       ├── main.ts         # NestFactory.createApplicationContext()
│       ├── worker.module.ts
│       └── order-processor/
│           ├── order-processor.service.ts  # Poll loop + idempotência
│           └── order-processor.module.ts
│
├── web/                    # (a ser criado na Fase 4 – feature/vue-frontend)
│   │                       # Vue 3 + Vite + Pinia + TailwindCSS
│   └── src/
│       ├── router/         # Vue Router + guard beforeEach
│       ├── stores/         # authStore + ordersStore (Pinia)
│       ├── api/            # Axios instance com interceptors JWT
│       ├── views/          # Login · OrdersList · CreateOrder · OrderDetail
│       └── components/     # AppHeader · OrderCard · StatusBadge
│
└── docs/
    └── architecture.png    # Diagrama de arquitetura exportado
```

## Serviços após `docker-compose up --build`

| Serviço       | URL                          | Descrição                     |
|---------------|------------------------------|-------------------------------|
| API REST      | http://localhost:3000        | NestJS – endpoints REST       |
| Frontend      | http://localhost:5173        | Vue 3 SPA                     |
| Adminer       | http://localhost:8080        | Interface web para o MySQL    |
| LocalStack    | http://localhost:4566        | Emulador local do AWS SQS     |

# Estrutura do Projeto – be-aliant-challenge

> Atualizada ao final de cada fase de desenvolvimento.

```
be-aliant-challenge/
│
├── package.json            # Raiz do monorepo – npm workspaces (api, worker, common)
│
├── docker-compose.yml      # Serviços: MySQL 8, Adminer, LocalStack (SQS), sqs-init, api, worker, web
├── .env.example            # Template de variáveis de ambiente (copiar para .env)
│
├── IMPLEMENTATION_PLAN_BEALIANT.md  # Plano arquitetural completo
├── README.md               # Como rodar, decisões técnicas (a expandir na Fase 5)
├── struct.md               # Este arquivo
├── status.md               # Histórico de fases e próximos passos
│
├── common/                 # Pacote compartilhado @be-aliant/common
│   ├── package.json
│   └── src/
│       ├── entities/
│       │   └── user.entity.ts     # Entidade User (TypeORM + @Exclude no password)
│       ├── dtos/
│       │   ├── create-user.dto.ts # Validação class-validator
│       │   ├── update-user.dto.ts # PartialType(CreateUserDto)
│       │   └── login.dto.ts
│       └── index.ts               # Barrel de exports
│
├── api/                    # NestJS Monolito Modular – REST API
│   ├── package.json        # Deps + Jest config + moduleNameMapper para @be-aliant/common
│   ├── tsconfig.json       # paths alias @be-aliant/common → ../common/src
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── Dockerfile          # Multi-stage (builder + production). Contexto: raiz do monorepo
│   └── src/
│       ├── main.ts         # Bootstrap: CORS, ValidationPipe, GlobalFilter, ClassSerializer
│       ├── app.module.ts   # ConfigModule (Joi) + TypeOrmModule async
│       ├── common/
│       │   ├── filters/
│       │   │   └── http-exception.filter.ts   # GlobalExceptionFilter
│       │   ├── interceptors/
│       │   │   └── logging.interceptor.ts     # LoggingInterceptor (método+path+status+ms)
│       │   └── decorators/
│       │       └── current-user.decorator.ts  # @CurrentUser()
│       └── modules/
│           ├── users/
│           │   ├── users.module.ts
│           │   ├── users.controller.ts        # POST /users · PUT /users/:id
│           │   ├── users.service.ts           # bcrypt hash · ConflictException
│           │   └── users.service.spec.ts      # 4 casos de teste
│           └── auth/
│               ├── auth.module.ts             # JWT async config
│               ├── auth.controller.ts         # POST /login
│               ├── auth.service.ts            # bcrypt compare · JWT sign
│               ├── auth.service.spec.ts       # 3 casos de teste
│               ├── jwt.strategy.ts            # PassportStrategy Bearer
│               └── jwt-auth.guard.ts          # JwtAuthGuard exportado
│
├── worker/                 # (a ser criado na Fase 3 – feature/worker-consumer)
│   └── src/
│       ├── main.ts         # createApplicationContext()
│       └── order-processor/
│
├── web/                    # (a ser criado na Fase 4 – feature/vue-frontend)
│   └── src/
│
└── docs/
    └── architecture.png    # Diagrama exportado (a gerar na Fase 5)
```

## Serviços após `docker-compose up --build`

| Serviço       | URL                          | Descrição                     |
|---------------|------------------------------|-------------------------------|
| API REST      | http://localhost:3000        | NestJS – endpoints REST       |
| Frontend      | http://localhost:5173        | Vue 3 SPA                     |
| Adminer       | http://localhost:8080        | Interface web para o MySQL    |
| LocalStack    | http://localhost:4566        | Emulador local do AWS SQS     |

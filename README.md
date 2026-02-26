# Be.Aliant Challenge — Sistema de Pedidos

*Monolito Modular + Event-Driven Worker + SPA Vue 3*

![CI](https://github.com/Daniel-Q-Reis/be-aliant-fullstack-challenge/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/Node-20-green)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![Vue](https://img.shields.io/badge/Vue-3-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✅ Checklist do Desafio

| Critério | Status | Observação |
|---|---|---|
| Endpoints obrigatórios (POST /users, PUT /users/:id, POST /login, POST /orders, GET /orders, GET /orders/:id) | ✅ | Escopo do desafio |
| MySQL + TypeORM | ✅ | Escopo do desafio |
| Docker Compose (API + Worker + DB + LocalStack) | ✅ | Escopo do desafio |
| JWT (autenticação e proteção de rotas) | ✅ | Escopo do desafio |
| Módulo isolado de mensageria (SQS) | ✅ | Escopo do desafio |
| Microserviço separado (Worker standalone) | ✅ | Escopo do desafio |
| Testes unitários (Services: Auth, Users, Orders, SQS, Consumer) | ✅ | Escopo do desafio |
| Async/await correto | ✅ | Escopo do desafio |
| Logs estruturados (NestJS Logger) | ✅ | Escopo do desafio |
| Tratamento de erros (ExceptionFilter, HttpException) | ✅ | Escopo do desafio |
| Padronização REST (status codes corretos) | ✅ | Escopo do desafio |
| Uso correto de filas (long polling + idempotência) | ✅ | Escopo do desafio |
| README completo (how-to, justificativas, diagrama, visão de produção) | ✅ | Escopo do desafio |
| Diagrama de arquitetura (Mermaid) | ✅ | Escopo do desafio |
| Scripts SQL (TypeORM sync/migrations) | ✅ | Escopo do desafio |
| Swagger / OpenAPI (`/api/docs`) | ✅ | Extra — UX para o avaliador |
| Coleção Postman (`be-aliant.postman_collection.json`) | ✅ | Extra — UX para o avaliador |
| Respostas Parte 2 — Raciocínio e Arquitetura (`docs/RESPOSTAS-PARTE-2.md`) | ✅ | Entrega escrita conforme solicitado |
| Parte 3 — Code Review Guiado | 🗓️ | A realizar na entrevista técnica |

---

## Como Rodar

> **Pré-requisito:** Docker Desktop (ou Docker Engine + Compose) instalado e rodando.

```bash
git clone https://github.com/Daniel-Q-Reis/be-aliant-fullstack-challenge.git
cd be-aliant-fullstack-challenge
cp .env.example .env
docker-compose up --build -d

# Opcional: popular banco com dados de demonstração
docker-compose exec api node dist/api/src/database/seed.js
```

| Serviço    | Endereço                  |
|------------|---------------------------|
| API REST   | http://localhost:3000     |
| Frontend   | http://localhost:5173     |
| Adminer    | http://localhost:8080     |
| LocalStack | http://localhost:4566     |
| Swagger    | http://localhost:3000/api/docs |

---

## Credenciais de Demonstração

Após executar o seed:

- **Email:** `admin@be-aliant.com`
- **Senha:** `123456`

---

## Testando com Postman

1. Importe o arquivo `be-aliant.postman_collection.json` no Postman
2. Execute **POST /users** para criar o usuário admin (pode pular se já rodou o seed)
3. Execute **POST /login** — o token JWT é salvo automaticamente na variável `{{token}}`
4. Execute os demais endpoints normalmente

> Se o seed já foi executado antes de abrir o Postman, o **POST /users** retornará `409 Conflict` — comportamento correto, o usuário já existe. Basta prosseguir com o login.

## Swagger / OpenAPI

A documentação interativa da API está disponível em: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Após efetuar login pelo Postman (ou pelo próprio Swagger), clique em **Authorize** e cole o token JWT para testar os endpoints protegidos diretamente na interface.

---

## Testes

```bash
# API (13 testes)
cd api && npm run test:cov

# Worker (3 testes)
cd ../worker && npm run test:cov
```

| Módulo | Testes | Cobertura dos serviços |
|---|---|---|
| API | 13 passed | auth 100% · sqs-producer 100% · users 95% · orders 84% |
| Worker | 3 passed | consumer 75% |

---

## Diagrama de Arquitetura

```mermaid
graph LR
  FE["Frontend\nVue 3 · :5173"]
  API["API NestJS\n:3000"]
  W["Worker NestJS\nStandalone"]
  DB[("MySQL 8\n:3306")]
  SQS["AWS SQS\nLocalStack :4566"]

  FE -->|REST + JWT| API
  API -->|TypeORM save| DB
  API -->|SendMessage| SQS
  W -->|Long Polling| SQS
  W -->|UPDATE condicional| DB
```

---

## Estrutura do Monorepo

| Pasta      | Responsabilidade                              |
|------------|-----------------------------------------------|
| `api/`     | NestJS HTTP API — Auth, Users, Orders         |
| `worker/`  | NestJS Standalone — SQS Consumer              |
| `web/`     | Vue 3 SPA — Vite + Pinia + Tailwind           |
| `common/`  | Entidades e DTOs compartilhados               |

---

## Justificativas de Decisões Técnicas

**NestJS vs Express puro**
DI nativo, ValidationPipe, decorators e modularidade clara eliminam boilerplate e tornam a base extensível sem perda de estrutura.

**Worker Standalone**
`NestFactory.createApplicationContext()` inicializa o DI sem servidor HTTP — sem overhead desnecessário para um processo que só consome fila.

**Idempotência via UPDATE condicional**
`UPDATE orders SET status='PROCESSADO' WHERE id=? AND status='PENDENTE'` — se `affected === 0`, a mensagem já foi processada por outra réplica e é descartada sem efeito colateral. Protege contra race condition sem precisar de locks distribuídos.

**`@Global()` no MessagingModule**
Evita reimportar `SqsProducerService` em cada módulo que precise publicar mensagens. Funciona como um singleton de infraestrutura.

---

## O que faria diferente em Produção

**Consistência transacional**
Implementação do Outbox Pattern: o evento SQS seria persistido na mesma transação do `save()`, eliminando a janela de falha entre salvar o pedido e publicar na fila.

**Infraestrutura AWS**
ECS Fargate para API e Worker escaláveis independentemente, Aurora MySQL Multi-AZ, ECR para imagens Docker e ALB na frente da API.

**Segurança**
Cognito ou Auth0 no lugar do JWT caseiro, AWS Secrets Manager para credenciais, HTTPS com ACM, rate limiting via API Gateway.

**Resiliência**
DLQ configurada no SQS (`maxReceiveCount: 3`), healthcheck endpoint com status de dependências (DB, SQS), retry com backoff exponencial no Worker.

**Qualidade**
Stryker para testes de mutação (métrica mais precisa que cobertura de linhas), SonarQube na pipeline CI, testes E2E com Cypress no frontend, migração para ESLint 9 flat config.

---

## Autor

**Daniel de Queiroz Reis**

[LinkedIn](https://www.linkedin.com/in/danielqreis/) · [GitHub](https://github.com/Daniel-Q-Reis/be-aliant-fullstack-challenge) · [danielqreis@gmail.com](mailto:danielqreis@gmail.com) · [WhatsApp](https://wa.me/5535991902471)

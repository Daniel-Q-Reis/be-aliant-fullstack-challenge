# Parte 2 – Teste de Raciocínio e Arquitetura

---

## 1. Quando você opta por microserviços e quando prefere monólito modular?

Opto por microserviços quando o domínio é grande, há múltiplas equipes, requisitos de escalabilidade independente, tecnologias diferentes ou ciclos de deploy desacoplados. Prefiro monólito modular em projetos menores ou com domínio bem delimitado.

Neste desafio, escolhi monólito modular com NestJS para a API (Auth, Users, Orders num único processo) e microserviço apenas para o Worker — que tem domínio isolado (processamento de fila) e pode escalar independentemente da API. Essa combinação atendeu a exigência explícita do "microserviço separado" sem introduzir complexidade desnecessária de rede, latência e consistência distribuída.

> **Complemento arquitetural:** uma estratégia comum em cenários reais é partir do monólito modular (como aqui) e extrair módulos em microserviços sob demanda — conhecido como **Strangler Fig Pattern**. O NestJS facilita essa transição porque a modularidade já é estrutural: cada módulo (`UsersModule`, `OrdersModule`) pode se tornar um serviço independente sem refatoração profunda do domínio.

---

## 2. Escalabilidade horizontal no AWS ECS ou Lambda

**Escalabilidade horizontal** no AWS significa adicionar mais instâncias (réplicas) em vez de aumentar recursos de uma única instância.

**ECS (Fargate):** define-se um Service com `desiredCount > 1`. O Auto Scaling adiciona réplicas baseado em CPU/memória ou na profundidade da fila SQS (métrica `ApproximateNumberOfMessages` via CloudWatch). Cada task é stateless — o estado fica no banco ou no SQS.

**Lambda:** escala automaticamente por invocação, sem gerenciamento de servidor. Suporta até milhares de execuções simultâneas. `Provisioned Concurrency` mitiga cold starts.

Neste projeto, tanto a API quanto o Worker são stateless e prontos para escalar horizontalmente via ECS Fargate.

---

## 3. O que é idempotência em APIs e por que é importante?

Idempotência significa que múltiplas chamadas idênticas produzem o mesmo efeito que uma única chamada. É crítica em sistemas distribuídos por causa de retries automáticos, falhas de rede e redelivery de mensagens.

Neste projeto, o Worker implementa idempotência com:
```sql
UPDATE orders SET status='PROCESSADO' WHERE id = ? AND status = 'PENDENTE'
```
Se `affected === 0`, a mensagem já foi processada por outra réplica e é descartada silenciosamente — protege contra processamento duplicado sem precisar de locks distribuídos.

> **Complemento:** em APIs HTTP, idempotência é garantida por métodos como `PUT` e `DELETE` (RFC 7231). Para operações `POST` não idempotentes por natureza, o padrão é usar uma **Idempotency-Key** no header — o cliente gera um UUID único por tentativa, o servidor persiste o resultado da primeira execução e devolve o mesmo response nas repetições. AWS SQS, Stripe e Shopify usam esse padrão extensivamente.

---

## 4. Como garantir resiliência em uma integração assíncrona usando SQS?

- **DeleteMessage apenas após processamento bem-sucedido** — mensagem volta à fila automaticamente após o `VisibilityTimeout` se o Worker falhar
- **DLQ (Dead Letter Queue)** com `redrive policy` (ex: `maxReceiveCount: 3`) — após N falhas, a mensagem é isolada para análise sem bloquear o fluxo principal
- **Idempotência no consumidor** — protege contra redelivery duplicado
- **Logging estruturado** — rastreabilidade de falhas por `orderId`
- **Retry com backoff exponencial** — evita sobrecarregar dependências com falhas em cascata

Neste projeto estão implementados: `deleteMessage` após UPDATE bem-sucedido e idempotência via UPDATE condicional. DLQ e backoff seriam o próximo passo em produção.

---

## 5. Padrão seguro de armazenamento de credenciais na AWS

Nunca armazenar chaves de acesso em código, variáveis de ambiente hardcoded ou repositório Git.

O padrão recomendado:
- **IAM Roles** para EC2, ECS e Lambda — sem `AWS_ACCESS_KEY_ID` exposta
- **AWS Secrets Manager** para segredos rotacionáveis (senhas de banco, JWT secret)
- **Parameter Store (SSM)** para configurações não-secretas
- **Least privilege** — cada serviço acessa apenas o que precisa
- **CloudTrail** para auditoria de acesso

Neste projeto: `.env` local com LocalStack para desenvolvimento. Em produção, API e Worker leriam credenciais do Secrets Manager via IAM Role da Task ECS.

---

## 6. Diferença entre rate limit, throttling e debouncing

| Conceito | Definição | Local típico |
|---|---|---|
| **Rate Limit** | Bloqueia após N requests num período (ex: 100 req/min) | Backend / API Gateway |
| **Throttling** | Rejeita ou enfileira requests que excedem a capacidade (HTTP 429) | Backend / infraestrutura |
| **Debouncing** | Atrasa execução até o evento parar por X ms | Frontend / navegador |

Rate limit **rejeita** por cota. Throttling **controla fluxo**. Debounce **espera silêncio**.

Em produção, adicionaria `@nestjs/throttler` na API e rate limiting no API Gateway.

---

## 7. Como otimizar consultas complexas no MySQL e identificar gargalos?

- **`EXPLAIN` / `EXPLAIN ANALYZE`** — identifica full table scans e joins sem índice
- **Índices** em colunas usadas em `WHERE`, `JOIN`, `ORDER BY` e `GROUP BY`
- **Evitar `SELECT *`** em tabelas grandes — selecionar apenas as colunas necessárias
- **Evitar N+1 queries** — usar `JOIN` ou `relations` do TypeORM em vez de buscar em loop
- **Slow Query Log** — captura queries acima de X ms em produção
- **Connection Pool** configurado adequadamente — evita overhead de nova conexão por request

Neste projeto, `userId` e `status` na tabela `orders` são candidatos a índice composto para otimizar o filtro `GET /orders?status=`. Via TypeORM, isso seria implementado com:
```typescript
@Entity()
@Index(['userId', 'status'])  // índice composto: filtra por dono + status em um único scan
export class OrderEntity { ... }
```

---

## 8. Debounce e Throttle em eventos do navegador

**Debounce:** executa a função apenas após o evento **parar de disparar** por X ms.  
Exemplo: campo de busca em tempo real — só dispara o `fetch` após 300ms sem digitar, evitando uma request por tecla pressionada.

**Throttle:** executa a função **no máximo uma vez** a cada X ms, independente da frequência de chamadas.  
Exemplo: evento `scroll` ou `resize` — processa no máximo a cada 100ms para não travar a UI com dezenas de execuções por segundo.

---

## 9. Promise.all() vs Promise.allSettled()

**`Promise.all()`** — executa em paralelo e resolve quando **todas** resolvem. Se **qualquer uma** rejeitar, rejeita imediatamente (**fail-fast**).
> Use quando todas as promises são obrigatórias — uma falha invalida o resultado.

**`Promise.allSettled()`** — executa em paralelo e aguarda **todas terminarem**, independente de sucesso ou falha. Retorna array com `{ status: 'fulfilled' | 'rejected', value/reason }`.
> Use quando quer processar resultados parciais — ex: enviar notificações para múltiplos usuários e logar as falhas sem cancelar as demais.

---

## 10. CORS — o que é e quem resolve?

CORS (Cross-Origin Resource Sharing) é um mecanismo de segurança do navegador que bloqueia requisições cross-origin a menos que o servidor permita explicitamente via headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.).

**Quem resolve: o Backend.** O frontend não tem como resolver CORS — o navegador exige que o servidor responda com os headers corretos. O frontend pode contornar via proxy de desenvolvimento (Vite proxy, por exemplo), mas em produção o backend precisa configurar.

Neste projeto: `app.enableCors()` configurado no `api/src/main.ts`, permitindo o frontend em `localhost:5173` consumir a API em `localhost:3000`.

> **Detalhe importante:** requisições com `Authorization` header (como as que usamos com JWT) são consideradas *non-simple requests* — o navegador envia um **preflight `OPTIONS`** antes da requisição real. O NestJS com `enableCors()` responde automaticamente a esse preflight com os headers corretos, o que é essencial para que a autenticação funcione no frontend.

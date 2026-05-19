# ClearFlow Finance API Documentation

Documentacao da API backend do ClearFlow Finance.

Base stack: NestJS, Prisma, PostgreSQL, JWT, class-validator.

## Base URL

```txt
http://localhost:3000/api/v1
```

Swagger:

```txt
http://localhost:3000/docs
```

## Autenticacao

A API usa JWT Bearer Token.

Depois de `POST /auth/register` ou `POST /auth/login`, a resposta retorna:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "displayName": "User",
      "createdAt": "2026-05-17T00:00:00.000Z",
      "updatedAt": "2026-05-17T00:00:00.000Z"
    },
    "accessToken": "jwt-token"
  }
}
```

Para endpoints protegidos, envie:

```http
Authorization: Bearer <accessToken>
```

No Swagger, clique em `Authorize` e cole apenas o token, sem a palavra `Bearer`.

Rotas publicas:

- `POST /auth/register`
- `POST /auth/login`

Todas as demais rotas exigem JWT.

## Formato Padrao de Resposta

Todas as respostas seguem o formato:

```json
{
  "success": true,
  "message": "Message",
  "data": {},
  "meta": {}
}
```

Erros:

```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null
}
```

`meta` e opcional. Normalmente aparece em listagens e agregacoes.

## Regras Gerais

- Todo recurso pertence ao usuario autenticado.
- O frontend nunca deve enviar `userId`.
- O backend pega o usuario pelo token JWT.
- Valores monetarios sao armazenados como `Decimal` no banco.
- Datas de dominio usam formato `YYYY-MM-DD` no request.
- Respostas de datas podem vir como ISO string.
- Endpoints de listagem normalmente aceitam filtros via query params.

## Auth

### POST /auth/register

Cria usuario, profile padrao e categorias padrao.

Request:

```json
{
  "email": "user@email.com",
  "password": "123456",
  "displayName": "User"
}
```

Campos:

- `email`: obrigatorio, email valido
- `password`: obrigatorio, minimo 6 caracteres
- `displayName`: opcional

Response:

```json
{
  "success": true,
  "message": "User registered",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "displayName": "User",
      "createdAt": "2026-05-17T00:00:00.000Z",
      "updatedAt": "2026-05-17T00:00:00.000Z"
    },
    "accessToken": "jwt-token"
  }
}
```

Categorias padrao criadas no cadastro:

- Moradia
- Alimentacao
- Transporte
- Saude
- Lazer
- Compras
- Outros

### POST /auth/login

Autentica usuario.

Request:

```json
{
  "email": "user@email.com",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "displayName": "User",
      "createdAt": "2026-05-17T00:00:00.000Z",
      "updatedAt": "2026-05-17T00:00:00.000Z"
    },
    "accessToken": "jwt-token"
  }
}
```

### POST /auth/logout

Logout stateless. O backend apenas retorna sucesso. O frontend deve remover o token localmente.

Response:

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

## Users

### PATCH /users/me

Atualiza dados basicos da conta.

Request:

```json
{
  "displayName": "New Name",
  "email": "new@email.com"
}
```

Campos:

- `displayName`: opcional, string, maximo 100 caracteres
- `email`: opcional, email valido e unico

Response:

```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "id": "uuid",
    "email": "new@email.com",
    "displayName": "New Name",
    "createdAt": "2026-05-17T00:00:00.000Z",
    "updatedAt": "2026-05-17T00:00:00.000Z"
  }
}
```

## Profile

Profile guarda preferencias do usuario.

### GET /profile

Busca profile do usuario autenticado.

Response:

```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "currency": "BRL",
    "theme": "dark",
    "createdAt": "2026-05-17T00:00:00.000Z",
    "updatedAt": "2026-05-17T00:00:00.000Z"
  }
}
```

### PATCH /profile

Atualiza preferencias.

Request:

```json
{
  "currency": "BRL",
  "theme": "dark"
}
```

Campos:

- `currency`: opcional, `BRL`, `USD` ou `EUR`
- `theme`: opcional, `dark`, `light` ou `system`

## Categories

Categorias de despesas.

### GET /categories

Lista categorias do usuario.

Response:

```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Moradia",
      "color": "#22c55e",
      "createdAt": "2026-05-17T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### POST /categories

Cria categoria.

Request:

```json
{
  "name": "Pets",
  "color": "#14b8a6"
}
```

Campos:

- `name`: obrigatorio, maximo 80 caracteres
- `color`: opcional, hex color

### PATCH /categories/:id

Atualiza categoria.

Request:

```json
{
  "name": "Pet shop",
  "color": "#0f766e"
}
```

### DELETE /categories/:id

Remove categoria.

Observacao: despesas antigas com essa categoria ficam com `categoryId = null`.

## Transactions

Despesas.

Enums:

```ts
ExpenseType = 'fixed' | 'variable' | 'installment'
ExpenseStatus = 'paid' | 'pending'
```

### GET /transactions

Lista despesas.

Query params:

- `month`: opcional, 1 a 12
- `year`: opcional
- `status`: opcional, `paid` ou `pending`
- `type`: opcional, `fixed`, `variable` ou `installment`
- `categoryId`: opcional, UUID

Exemplos:

```txt
GET /transactions?month=5&year=2026
GET /transactions?status=pending
GET /transactions?type=installment
GET /transactions?categoryId=<uuid>
```

Observacao: se enviar `month`, tambem envie `year`.

Response:

```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "description": "Mercado",
      "amount": "150.75",
      "date": "2026-05-17T00:00:00.000Z",
      "categoryId": "uuid",
      "type": "variable",
      "status": "pending",
      "installmentInfo": null,
      "totalInstallments": null,
      "installmentNumber": null,
      "createdAt": "2026-05-17T00:00:00.000Z",
      "updatedAt": "2026-05-17T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Alimentacao",
        "color": "#f97316"
      }
    }
  ],
  "meta": {
    "total": 1
  }
}
```

### GET /transactions/:id

Busca detalhe de uma despesa.

### POST /transactions

Cria despesa.

Request para despesa comum:

```json
{
  "description": "Mercado",
  "amount": 150.75,
  "date": "2026-05-17",
  "categoryId": "uuid",
  "type": "variable",
  "status": "pending"
}
```

Campos:

- `description`: obrigatorio
- `amount`: obrigatorio, positivo
- `date`: obrigatorio, `YYYY-MM-DD`
- `categoryId`: opcional, precisa pertencer ao usuario
- `type`: opcional, default `variable`
- `status`: opcional, default `pending`
- `totalInstallments`: obrigatorio apenas quando `type = installment`

Request para despesa parcelada:

```json
{
  "description": "Notebook",
  "amount": 300,
  "date": "2026-05-17",
  "categoryId": "uuid",
  "type": "installment",
  "totalInstallments": 10
}
```

Com `type = installment`, a API cria automaticamente N registros, um por parcela:

- `installmentInfo`: `1/10`, `2/10`, etc.
- `installmentNumber`: numero da parcela
- `totalInstallments`: total de parcelas
- `status`: sempre `pending`
- datas incrementadas mes a mes

### PATCH /transactions/:id

Atualiza despesa.

Request:

```json
{
  "description": "Mercado atualizado",
  "amount": 180,
  "date": "2026-05-18",
  "categoryId": "uuid",
  "type": "variable",
  "status": "paid"
}
```

### PATCH /transactions/:id/pay

Marca despesa como paga.

### DELETE /transactions/:id

Remove despesa.

## Incomes

Receitas.

Enums:

```ts
IncomeType = 'fixed' | 'variable'
```

### GET /incomes

Query params:

- `month`: opcional, 1 a 12
- `year`: opcional
- `type`: opcional, `fixed` ou `variable`

Exemplos:

```txt
GET /incomes?month=5&year=2026
GET /incomes?type=fixed
```

### GET /incomes/:id

Busca receita.

### POST /incomes

Cria receita.

Request:

```json
{
  "name": "Salario",
  "amount": 5000,
  "date": "2026-05-17",
  "type": "fixed"
}
```

Campos:

- `name`: obrigatorio
- `amount`: obrigatorio, positivo
- `date`: obrigatorio
- `type`: opcional, default `fixed`

### PATCH /incomes/:id

Atualiza receita.

### DELETE /incomes/:id

Remove receita.

## Piggy Banks

Cofrinhos/metas.

### GET /piggy-banks

Lista cofrinhos.

### GET /piggy-banks/:id

Busca cofrinho.

### POST /piggy-banks

Cria cofrinho.

Request:

```json
{
  "name": "Reserva",
  "targetAmount": 10000,
  "icon": "piggy"
}
```

Campos:

- `name`: obrigatorio, maximo 100 caracteres
- `targetAmount`: obrigatorio, positivo
- `icon`: opcional, maximo 40 caracteres

### PATCH /piggy-banks/:id

Atualiza cofrinho.

Request:

```json
{
  "name": "Reserva emergencia",
  "targetAmount": 12000,
  "icon": "safe"
}
```

### POST /piggy-banks/:id/deposit

Deposita valor.

Request:

```json
{
  "amount": 500
}
```

Response inclui:

```json
{
  "meta": {
    "completed": false
  }
}
```

`completed` sera `true` quando `currentAmount >= targetAmount`.

### POST /piggy-banks/:id/withdraw

Saca valor.

Request:

```json
{
  "amount": 100
}
```

Se o valor solicitado deixar o saldo abaixo de zero, retorna erro.

### DELETE /piggy-banks/:id

Remove cofrinho.

## Investments

Investimentos.

Enums:

```ts
InvestmentType = 'stock' | 'fixed_income' | 'crypto' | 'fund'
```

### GET /investments

Query params:

- `type`: opcional

Exemplo:

```txt
GET /investments?type=crypto
```

### GET /investments/:id

Busca investimento.

### POST /investments

Cria investimento.

Request:

```json
{
  "name": "Bitcoin",
  "type": "crypto",
  "investedAmount": 1000,
  "currentAmount": 1250
}
```

Response inclui campos calculados:

```json
{
  "profit": 250,
  "profitPercent": 25
}
```

### PATCH /investments/:id

Atualiza investimento.

### DELETE /investments/:id

Remove investimento.

## Credit Cards

Cartoes de credito.

### GET /credit-cards

Lista cartoes.

### GET /credit-cards/:id

Busca cartao.

### POST /credit-cards

Cria cartao.

Request:

```json
{
  "name": "Nubank",
  "color": "#7c3aed"
}
```

Campos:

- `name`: obrigatorio, maximo 100 caracteres
- `color`: opcional, hex color

### PATCH /credit-cards/:id

Atualiza cartao.

### DELETE /credit-cards/:id

Remove cartao.

Observacao: faturas desse cartao sao removidas em cascata pelo banco.

## Invoices

Faturas de cartao.

Enums:

```ts
InvoiceStatus = 'open' | 'closed' | 'overdue'
```

### GET /invoices

Lista faturas.

Query params:

- `creditCardId`: opcional, UUID
- `status`: opcional, `open`, `closed` ou `overdue`

Exemplos:

```txt
GET /invoices
GET /invoices?creditCardId=<uuid>
GET /invoices?status=open
```

### GET /invoices/:id

Busca fatura com compras.

### POST /invoices

Cria fatura.

Request:

```json
{
  "creditCardId": "uuid",
  "dueDate": "2026-05-20",
  "closingDate": "2026-05-10",
  "status": "open"
}
```

Campos:

- `creditCardId`: obrigatorio, precisa pertencer ao usuario
- `dueDate`: obrigatorio
- `closingDate`: opcional
- `status`: opcional, default `open`

### PATCH /invoices/:id

Atualiza fatura.

Request:

```json
{
  "dueDate": "2026-05-25",
  "closingDate": "2026-05-15",
  "status": "closed"
}
```

### DELETE /invoices/:id

Remove fatura e compras em cascata.

### POST /invoices/:id/purchases

Adiciona compra na fatura.

Request:

```json
{
  "description": "Amazon",
  "amount": 199.9,
  "date": "2026-05-17",
  "category": "Compras"
}
```

Ao adicionar compra, a API recalcula automaticamente `invoice.totalAmount`.

Response:

```json
{
  "success": true,
  "message": "Invoice purchase created",
  "data": {
    "purchase": {},
    "invoice": {}
  }
}
```

### PATCH /invoices/:id/purchases/:purchaseId

Atualiza compra e recalcula total da fatura.

### DELETE /invoices/:id/purchases/:purchaseId

Remove compra e recalcula total da fatura.

## Dashboard

Dados agregados para tela inicial.

### GET /dashboard/summary

Query params:

- `month`: opcional
- `year`: opcional

Exemplo:

```txt
GET /dashboard/summary?month=5&year=2026
```

Response:

```json
{
  "success": true,
  "message": "Dashboard summary retrieved",
  "data": {
    "totalIncomes": 5000,
    "totalExpenses": 1200,
    "balance": 3800,
    "totalPaidExpenses": 800,
    "totalPendingExpenses": 400,
    "piggyBanksBalance": 2500,
    "investedAmount": 10000,
    "investmentsCurrentAmount": 11200,
    "investmentsProfit": 1200,
    "openInvoicesAmount": 900
  }
}
```

### GET /dashboard/categories

Gastos por categoria.

Query params:

- `month`: opcional
- `year`: opcional

Response:

```json
{
  "success": true,
  "message": "Dashboard categories retrieved",
  "data": [
    {
      "categoryId": "uuid",
      "categoryName": "Alimentacao",
      "color": "#f97316",
      "totalAmount": 500,
      "totalTransactions": 4
    }
  ]
}
```

Despesas sem categoria aparecem como:

```json
{
  "categoryName": "Uncategorized",
  "color": "#64748b"
}
```

### GET /dashboard/alerts

Retorna faturas vencidas e vencendo nos proximos 7 dias.

Response:

```json
{
  "success": true,
  "message": "Dashboard alerts retrieved",
  "data": {
    "overdueInvoices": [],
    "dueSoonInvoices": []
  },
  "meta": {
    "overdue": 0,
    "dueSoon": 0
  }
}
```

## Reports

Relatorios analiticos.

### GET /reports/cashflow

Fluxo de caixa mensal.

Query params:

- `months`: opcional, 1 a 60, default 6

Exemplo:

```txt
GET /reports/cashflow?months=6
```

Response:

```json
{
  "success": true,
  "message": "Cashflow report retrieved",
  "data": [
    {
      "month": 5,
      "year": 2026,
      "label": "2026-05",
      "incomes": 5000,
      "expenses": 1200,
      "balance": 3800
    }
  ],
  "meta": {
    "months": 6
  }
}
```

### GET /reports/monthly-evolution

Evolucao mensal aproximada.

Query params:

- `months`: opcional, 1 a 60, default 6

Response:

```json
{
  "success": true,
  "message": "Monthly evolution report retrieved",
  "data": [
    {
      "month": 5,
      "year": 2026,
      "label": "2026-05",
      "incomes": 5000,
      "expenses": 1200,
      "balance": 3800,
      "accumulatedBalance": 3800,
      "piggyBanksBalance": 2500,
      "investedAmount": 10000,
      "investmentsCurrentAmount": 11200,
      "estimatedNetWorth": 17500
    }
  ],
  "meta": {
    "months": 6
  }
}
```

### GET /reports/categories

Breakdown de categorias.

Pode usar mes/ano:

```txt
GET /reports/categories?month=5&year=2026
```

Ou periodo customizado:

```txt
GET /reports/categories?startDate=2026-01-01&endDate=2026-05-31
```

Response:

```json
{
  "success": true,
  "message": "Categories report retrieved",
  "data": [
    {
      "categoryId": "uuid",
      "categoryName": "Alimentacao",
      "color": "#f97316",
      "totalAmount": 500,
      "totalTransactions": 4,
      "percentage": 25
    }
  ],
  "meta": {
    "total": 1,
    "totalAmount": 2000
  }
}
```

## Sugestao de Fluxo Inicial no Frontend

### Primeiro acesso

1. Usuario abre app sem token.
2. Front redireciona para login.
3. Usuario registra ou faz login.
4. Front salva `accessToken`.
5. Front salva `user` retornado no login/register.
6. Front busca dados iniciais:
   - `GET /profile`
   - `GET /categories`
   - `GET /dashboard/summary?month=<currentMonth>&year=<currentYear>`
   - `GET /dashboard/categories?month=<currentMonth>&year=<currentYear>`
   - `GET /dashboard/alerts`

### Dashboard inicial

Recomendado carregar:

```txt
GET /dashboard/summary?month=5&year=2026
GET /dashboard/categories?month=5&year=2026
GET /dashboard/alerts
GET /transactions?month=5&year=2026
GET /incomes?month=5&year=2026
```

### Tela de despesas

Carregar:

```txt
GET /categories
GET /transactions?month=5&year=2026
```

Para criar despesa:

```txt
POST /transactions
```

### Tela de faturas

Carregar:

```txt
GET /credit-cards
GET /invoices
```

Ao selecionar fatura:

```txt
GET /invoices/:id
```

Para adicionar compra:

```txt
POST /invoices/:id/purchases
```

## Observacoes para o Frontend

- Se receber `401`, limpar token e redirecionar para login.
- Se receber `403` ou `404`, tratar como recurso inexistente para o usuario atual.
- O backend ja isola recursos por usuario.
- O frontend nao deve mandar nem confiar em `userId`.
- `DELETE` retorna `data: null`.
- Em filtros por mes, sempre enviar `month` junto com `year`.
- Para valores monetarios, trate respostas como numero ou string parseavel.
- Para datas em inputs, envie `YYYY-MM-DD`.
- Para datas vindas da API, normalize para exibicao local no frontend.

## Checklist de Integracao

- [ ] Configurar client HTTP com `baseURL = http://localhost:3000/api/v1`
- [ ] Adicionar interceptor para `Authorization: Bearer <token>`
- [ ] Implementar refresh de estado apos login/register
- [ ] Implementar logout removendo token local
- [ ] Criar services/hooks por dominio:
  - auth
  - users
  - profile
  - categories
  - transactions
  - incomes
  - piggyBanks
  - investments
  - creditCards
  - invoices
  - dashboard
  - reports
- [ ] Tratar erros padronizados por `message`
- [ ] Normalizar dinheiro e datas em uma camada utilitaria


# FinanceHub Web v2

> Personal finance dashboard built with Next.js 16, React 19 and Tailwind CSS 4 — server-rendered pages, Server Actions and an httpOnly cookie session on top of the FinanceHub REST API.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**[⚙️ API: fin-api-v2](https://github.com/Luan-Neumann-Dev/fin-api-v2) • [📖 API Documentation](API_DOCUMENTATION.md)**

---

## 🎯 About

FinanceHub Web v2 is the web client of a personal finance app. It shows the month at a glance on a dashboard and has a page for each part of the routine: expenses, income, credit card invoices, savings goals, investments and reports. The interface is in Brazilian Portuguese.

The app has no database of its own. Every page is rendered on the server and talks to the [FinanceHub API v2](https://github.com/Luan-Neumann-Dev/fin-api-v2) (NestJS + Prisma). The JWT never reaches the browser's JavaScript: it lives in an httpOnly cookie and is read only by server code.

This is the second version of FinanceHub. The [first version](https://github.com/Luan-Neumann-Dev/finance-hub-web) was a Next.js 15 dashboard. v2 was rewritten around Server Components and Server Actions. The ideas from both versions later grew into [Cifrão](https://github.com/Luan-Neumann-Dev/cifrao).

## ✨ Key Features

- 📊 **Dashboard** - Monthly balance, spending by category and alerts for overdue invoices and invoices due in the next 7 days.
- 💸 **Expenses and income** - Fixed, variable and installment expenses, with a "mark as paid" action.
- 💳 **Credit card invoices** - Cards, invoices and the purchases inside each invoice.
- 🐷 **Savings goals** - Piggy banks with progress bars, deposits and withdrawals.
- 📈 **Investments** - Invested vs. current amount per asset.
- 📉 **Reports** - Cash flow, monthly evolution and spending by category, with a month selector.
- 🔒 **Month closing** - Close a month to lock its expenses against new entries, payments and deletions.
- 🔐 **Protected routes** - Login and registration in one form, with a session check on every route.

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16 (App Router) - Server Components, Server Actions and route protection
- React 19 - UI
- TypeScript 5 - Language
- Tailwind CSS 4 - Styling
- class-variance-authority + tailwind-merge - Component variants (button, badge, input)
- Zod 4 - Form validation in Server Actions
- Lucide - Icons

**Backend:**
- [FinanceHub API v2](https://github.com/Luan-Neumann-Dev/fin-api-v2) - NestJS, Prisma and PostgreSQL

**Tools:**
- ESLint
- pnpm

## 🚀 Quick Start

The API must be running first. Follow the setup in [fin-api-v2](https://github.com/Luan-Neumann-Dev/fin-api-v2) and start it on port 3005.

```bash
# Clone the repository
git clone https://github.com/Luan-Neumann-Dev/fin-hub-v2.git
cd fin-hub-v2

# Install dependencies
pnpm install

# Run the project
pnpm dev
```

Open `http://localhost:3000` and create an account on the login page.

The app calls `http://localhost:3005/api/v1` by default. To use another address, create a `.env.local`:

```env
CLEARFLOW_API_URL="http://localhost:3005/api/v1"
```

## 📁 Project Structure

```
fin-hub-v2/
├── app/
│   ├── (auth)/login/          # Login and registration
│   ├── (app)/                 # Authenticated area (sidebar layout)
│   │   ├── page.tsx           # Dashboard
│   │   ├── expenses/
│   │   ├── incomes/
│   │   ├── invoices/
│   │   ├── piggy-banks/
│   │   ├── investments/
│   │   └── reports/
│   └── actions/               # Server Actions (mutations)
├── components/
│   ├── finance/               # Dialogs, cards, month selector
│   ├── layout/                # Sidebar
│   └── ui/                    # Button, badge, input
├── lib/
│   ├── api/                   # Typed API client, one file per module
│   ├── session.ts             # httpOnly cookie session
│   └── month-closing.ts       # Closed months
├── proxy.ts                   # Redirects visitors without a session
└── API_DOCUMENTATION.md       # Backend API reference
```

## 💡 Technical Highlights

### Server-only API client

`lib/api/client.ts` is marked `server-only`, so it can't be imported into a Client Component by mistake. It reads the token from the cookie, attaches the `Authorization` header, unwraps the API's `{ success, message, data }` envelope and sends the user back to `/login` when the API answers 401:

```typescript
if (requiresAuth) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  headers.set("Authorization", `Bearer ${token}`);
}
```

### Route protection with `proxy.ts`

Next.js 16 replaces `middleware.ts` with `proxy.ts`. It redirects visitors without a session cookie to `/login` and sends logged-in users away from the login page:

```typescript
if (!hasSession && !isPublicRoute) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

### Mutations with Server Actions

Forms post to Server Actions in `app/actions/`. Each action validates the input with Zod, calls the API and revalidates the page, so there is no client-side data-fetching library.

## 📚 What I Learned

**Technical Skills:**
- **Next.js 16 App Router** - Server Components, route groups, `loading.tsx` and the new `proxy.ts`
- **Server Actions** - Handling forms and mutations on the server with Zod validation
- **Session handling** - Keeping a JWT in httpOnly cookies instead of `localStorage`

**Best Practices:**
- A typed API layer separated from the UI
- Small reusable UI components with variants
- Keeping secrets and tokens out of client code

## 🗺️ Roadmap

- [ ] Store closed months in the API instead of a cookie
- [ ] Tests for the Server Actions and API client
- [ ] Deploy

## 📝 Notes

- The interface is in Brazilian Portuguese (pt-BR).
- Closed months are stored in a cookie, so they apply only to the current browser.

## 👤 Author

**Luan Henrique Neumann**

- LinkedIn: [luan-henrique-neumann-dev](https://linkedin.com/in/luan-henrique-neumann-dev)
- GitHub: [@Luan-Neumann-Dev](https://github.com/Luan-Neumann-Dev)

---

⭐ Found this helpful? Give it a star!

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiListResponse<T> = ApiResponse<T[]> & {
  meta?: {
    total?: number;
    [key: string]: unknown;
  };
};

export type User = {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
};

export type DashboardSummary = {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  totalPaidExpenses: number;
  totalPendingExpenses: number;
  piggyBanksBalance: number;
  investedAmount: number;
  investmentsCurrentAmount: number;
  investmentsProfit: number;
  openInvoicesAmount: number;
};

export type DashboardCategory = {
  categoryId?: string;
  categoryName: string;
  color: string;
  totalAmount: number;
  totalTransactions: number;
};

export type DashboardAlerts = {
  overdueInvoices: unknown[];
  dueSoonInvoices: unknown[];
};

export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  description: string;
  amount: string | number;
  date: string;
  categoryId: string | null;
  type: "fixed" | "variable" | "installment";
  status: "paid" | "pending";
  installmentInfo: string | null;
  totalInstallments: number | null;
  installmentNumber: number | null;
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export type Income = {
  id: string;
  name: string;
  amount: string | number;
  date: string;
  type: "fixed" | "variable";
};

export type PiggyBank = {
  id: string;
  name: string;
  targetAmount: string | number;
  currentAmount: string | number;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
};

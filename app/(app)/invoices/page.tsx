import { CreditCard } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function InvoicesPage() {
  return (
    <ModulePlaceholder
      title="Faturas"
      description="Acompanhe cartoes, faturas e compras."
      icon={CreditCard}
      actionLabel="Nova fatura"
    />
  );
}

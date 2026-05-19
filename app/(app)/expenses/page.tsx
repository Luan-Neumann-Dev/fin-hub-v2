import { Receipt } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function ExpensesPage() {
  return (
    <ModulePlaceholder
      title="Despesas"
      description="Controle gastos fixos, variaveis e parcelados."
      icon={Receipt}
      actionLabel="Nova despesa"
    />
  );
}

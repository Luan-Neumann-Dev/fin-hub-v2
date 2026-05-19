import { TrendingUp } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function InvestmentsPage() {
  return (
    <ModulePlaceholder
      title="Investimentos"
      description="Acompanhe patrimonio, aporte e rendimento."
      icon={TrendingUp}
      actionLabel="Novo investimento"
    />
  );
}

import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Relatorios"
      description="Analise fluxo de caixa, evolucao e categorias."
      icon={BarChart3}
    />
  );
}

import { Wallet } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function IncomesPage() {
  return (
    <ModulePlaceholder
      title="Receitas"
      description="Gerencie suas fontes de renda mensais."
      icon={Wallet}
      actionLabel="Nova receita"
    />
  );
}

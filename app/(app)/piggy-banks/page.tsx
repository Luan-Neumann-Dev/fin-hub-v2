import { PiggyBank } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function PiggyBanksPage() {
  return (
    <ModulePlaceholder
      title="Cofrinhos"
      description="Organize metas e reservas financeiras."
      icon={PiggyBank}
      actionLabel="Nova meta"
    />
  );
}

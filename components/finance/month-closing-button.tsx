import { Lock, Unlock } from "lucide-react";
import { toggleMonthClosing } from "@/app/actions/month-closing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MonthClosingButton({
  month,
  year,
  pathname,
  isClosed,
}: {
  month: number;
  year: number;
  pathname: string;
  isClosed: boolean;
}) {
  return (
    <form action={toggleMonthClosing}>
      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="pathname" value={pathname} />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        className={cn(
          "h-10",
          isClosed &&
            "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
        )}
      >
        {isClosed ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <Unlock className="h-3.5 w-3.5" />
        )}
        {isClosed ? "Mes fechado" : "Fechar mes"}
      </Button>
    </form>
  );
}

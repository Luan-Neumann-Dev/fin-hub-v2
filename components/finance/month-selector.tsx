import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function addMonth(month: number, year: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function href(pathname: string, month: number, year: number) {
  return `${pathname}?month=${month}&year=${year}`;
}

export function MonthSelector({
  month,
  year,
  pathname,
}: {
  month: number;
  year: number;
  pathname: string;
}) {
  const previous = addMonth(month, year, -1);
  const next = addMonth(month, year, 1);

  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card p-1 shadow-sm">
      <Link
        href={href(pathname, previous.month, previous.year)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="min-w-40 text-center text-sm font-semibold text-foreground">
        {monthNames[month - 1]} {year}
      </span>
      <Link
        href={href(pathname, next.month, next.year)}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Proximo mes"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

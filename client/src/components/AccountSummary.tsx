import type { ReactNode } from "react";

interface Row {
  label: string;
  value: string | number | ReactNode;
}

interface Props {
  title: string;
  rows: Row[];
}

export const AccountSummary = ({ title, rows }: Props) => (
  <section className="card space-y-3">
    <h2 className="text-base font-semibold">{title}</h2>
    <div className="space-y-2 text-sm text-stone-600">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-stone-800 dark:text-stone-100">{row.label}:</span>
          <span>{row.value}</span>
        </div>
      ))}
    </div>
  </section>
);

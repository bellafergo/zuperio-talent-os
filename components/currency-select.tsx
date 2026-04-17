import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

export function CurrencySelect({
  id,
  name = "currency",
  defaultValue,
  "aria-invalid": ariaInvalid,
}: {
  id?: string;
  name?: string;
  defaultValue?: string | null;
  "aria-invalid"?: boolean;
}) {
  const v =
    defaultValue?.trim().toUpperCase() === "USD"
      ? "USD"
      : defaultValue?.trim().toUpperCase() === "MXN"
        ? "MXN"
        : DEFAULT_CURRENCY;

  return (
    <select
      id={id}
      name={name}
      className={selectClass}
      defaultValue={v}
      aria-invalid={ariaInvalid}
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c === "MXN" ? "MXN — Peso mexicano" : "USD — Dólar estadounidense"}
        </option>
      ))}
    </select>
  );
}

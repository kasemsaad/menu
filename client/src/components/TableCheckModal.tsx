import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Receipt } from "lucide-react";
import api from "@/lib/api";
import type { Order, TableCheck } from "@/types";
import { formatPrice } from "@/lib/utils";

type Props = {
  tableId: string | null;
  open: boolean;
  onClose: () => void;
};

export const TableCheckModal = ({ tableId, open, onClose }: Props) => {
  const { t } = useTranslation();
  const [check, setCheck] = useState<TableCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !tableId) {
      setCheck(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .get<TableCheck>(`/tables/${tableId}/check`)
      .then((r) => setCheck(r.data))
      .catch(() => setError(t("errorGeneric")))
      .finally(() => setLoading(false));
  }, [open, tableId, t]);

  if (!open) return null;


  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal
    >
      <article className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-stone-900">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-display flex items-center gap-2 text-xl font-bold">
            <Receipt size={22} />
            {t("tableCheck")} — {t("table")} {check?.tableNumber ?? "…"}
          </h2>
          <button type="button" className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {loading && <p className="text-sm text-stone-500">{t("loading")}…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && check && (
          <>
            {check.orderCount === 0 ? (
              <p className="text-sm text-stone-500">{t("noTableOrders")}</p>
            ) : (
              <>
                <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto text-sm">
                  {(check.orders as Order[]).map((o) => (
                    <li
                      key={o._id}
                      className="flex justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-800"
                    >
                      <span className="font-mono text-xs">{o.orderNumber}</span>
                      <span className="text-stone-500">{t(o.status)}</span>
                      <span className="font-medium">{formatPrice(o.total)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-2 border-t border-stone-200 pt-3 text-sm dark:border-stone-700">
                  <div className="flex justify-between">
                    <dt>{t("subtotal")}</dt>
                    <dd>{formatPrice(check.subtotal)}</dd>
                  </div>
                  {check.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <dt>{t("discount")}</dt>
                      <dd>-{formatPrice(check.discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>{t("tax")}</dt>
                    <dd>{formatPrice(check.tax)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>
                      {t("serviceCharge")} ({check.servicePercent}%)
                    </dt>
                    <dd>{formatPrice(check.serviceCharge)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold dark:border-stone-700">
                    <dt>{t("grandTotal")}</dt>
                    <dd className="text-brand-600">{formatPrice(check.grandTotal)}</dd>
                  </div>
                </dl>
              </>
            )}
          </>
        )}
      </article>
    </div>
  );
};

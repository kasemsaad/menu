import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Receipt } from "lucide-react";
import api from "@/lib/api";
import type { Order, TableCheck } from "@/types";
import { formatPrice } from "@/lib/utils";

type Props = {
  tableId?: string | null;
  open: boolean;
  onClose: () => void;
  check?: TableCheck | null;
  fetchCheck?: boolean;
  loading?: boolean;
};

export const TableCheckModal = ({
  tableId,
  open,
  onClose,
  check: checkData,
  fetchCheck = true,
  loading: externalLoading,
}: Props) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";
  const [check, setCheck] = useState<TableCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoading = externalLoading ?? loading;

  useEffect(() => {
    if (!open) {
      setCheck(null);
      setError(null);
      return;
    }
    if (checkData) {
      setCheck(checkData);
      setLoading(false);
      setError(null);
      return;
    }
    if (!fetchCheck) {
      setCheck(null);
      setError(null);
      setLoading(false);
      return;
    }
    if (!tableId) {
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
  }, [open, tableId, t, checkData, fetchCheck]);

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

        {isLoading && <p className="text-sm text-stone-500">{t("loading")}…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!isLoading && check && (
          <>
            {check.orderCount === 0 ? (
              <p className="text-sm text-stone-500">{t("noTableOrders")}</p>
            ) : (
              <>
                <div className="space-y-4">
                  {(check.orders as Order[]).map((o) => (
                    <div key={o._id} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{o.orderNumber}</p>
                          <p className="text-xs text-stone-500">{t(o.status)}</p>
                        </div>
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-100">{formatPrice(o.total)}</p>
                      </div>
                      <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                        {o.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="rounded-2xl bg-stone-50 p-3 dark:bg-stone-950">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium">{item.name[locale]}</p>
                                <p className="text-xs text-stone-500">
                                  {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                              <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                            </div>
                            {item.addons.length > 0 && (
                              <div className="mt-2 rounded-2xl bg-stone-100 px-3 py-2 text-xs text-stone-500 dark:bg-stone-900">
                                {item.addons.map((addon, addonIndex) => (
                                  <div key={addonIndex} className="flex justify-between">
                                    <span>{addon.name[locale]}</span>
                                    <span>{formatPrice(addon.price)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.notes && (
                              <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30">
                                {item.notes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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

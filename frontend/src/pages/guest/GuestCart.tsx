import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { t as loc, formatPrice } from "@/lib/utils";

export const GuestCart = () => {
  const { basePath } = useOutletContext<{ basePath: string }>();
  const { t, i18n } = useTranslation();
  const { items, updateQty, removeItem, total } = useCart();
  const lang = i18n.language;

  if (!items.length) {
    return (
      <section className="py-16 text-center">
        <p className="text-stone-500">{t("emptyCart")}</p>
        <Link to={`${basePath}/menu`} className="btn-primary mt-4 inline-flex">
          {t("menu")}
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {items.map((item) => (
        <article key={`${item.productId}-${item.notes}`} className="card flex gap-3">
          <section className="flex-1">
            <h3 className="font-semibold">{loc(item.name, lang)}</h3>
            {item.notes && <p className="text-xs text-stone-500">{item.notes}</p>}
            <p className="mt-1 font-bold text-brand-600">{formatPrice(item.subtotal)}</p>
          </section>
          <section className="flex flex-col items-end justify-between">
            <button type="button" onClick={() => removeItem(item.productId)} className="text-red-500">
              <Trash2 size={18} />
            </button>
            <section className="flex items-center gap-2">
              <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)} className="rounded bg-stone-100 p-1 dark:bg-stone-800">
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)} className="rounded bg-stone-100 p-1 dark:bg-stone-800">
                <Plus size={14} />
              </button>
            </section>
          </section>
        </article>
      ))}
      <section className="card">
        <section className="flex justify-between text-lg font-bold">
          <span>{t("total")}</span>
          <span className="text-brand-600">{formatPrice(total)}</span>
        </section>
        <Link to={`${basePath}/checkout`} className="btn-primary mt-4 flex w-full">
          {t("checkout")}
        </Link>
      </section>
    </section>
  );
};

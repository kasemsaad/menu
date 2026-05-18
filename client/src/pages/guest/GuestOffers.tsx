import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import type { Offer } from "@/types";
import { t as loc } from "@/lib/utils";

export const GuestOffers = () => {
  const { t, i18n } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    api.get("/offers").then((r) => setOffers(r.data));
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold">{t("offers")}</h2>
      {offers.map((o) => (
        <article
          key={o._id}
          className="overflow-hidden rounded-2xl bg-hero-brand p-5 text-white shadow-lg"
        >
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            -{o.discountPercent}%
          </span>
          <h3 className="mt-2 font-display text-lg font-bold">{loc(o.title, i18n.language)}</h3>
          {o.description && (
            <p className="mt-1 text-sm opacity-90">{loc(o.description, i18n.language)}</p>
          )}
        </article>
      ))}
      {!offers.length && <p className="text-stone-500">No active offers</p>}
    </section>
  );
};

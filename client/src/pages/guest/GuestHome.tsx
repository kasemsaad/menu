import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Sparkles } from "lucide-react";
import api from "@/lib/api";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";

export const GuestHome = () => {
  const { basePath } = useOutletContext<{ basePath: string }>();
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/products/featured").then((r) => setFeatured(r.data));
  }, []);

  return (
    <section className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-hero-brand p-6 text-white shadow-xl">
        <Sparkles className="absolute right-4 top-4 opacity-30" size={48} />
        <p className="text-sm font-medium uppercase tracking-wider opacity-90">{t("featured")}</p>
        <h2 className="mt-1 font-display text-2xl font-bold">{t("appName")}</h2>
        <p className="mt-2 max-w-xs text-sm opacity-90">Scan, order, enjoy — fresh from our kitchen.</p>
        <Link to={`${basePath}/menu`} className="mt-4 inline-block rounded-xl bg-white px-5 py-2 text-sm font-bold text-brand-700">
          {t("menu")}
        </Link>
      </section>
      <Link
        to={`${basePath}/menu`}
        className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-700 dark:bg-stone-900"
      >
        <Search className="text-stone-400" size={20} />
        <span className="text-stone-500">{t("search")}</span>
      </Link>
      <section>
        <h3 className="mb-3 font-display text-lg font-semibold">{t("featured")}</h3>
        <section className="space-y-3">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} basePath={basePath} />
          ))}
        </section>
      </section>
    </section>
  );
};

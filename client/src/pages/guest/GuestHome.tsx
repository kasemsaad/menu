import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import api from "@/lib/api";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import HeroBanner from "@/components/HeroBanner";

export const GuestHome = () => {
  const { basePath } = useOutletContext<{ basePath: string }>();
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/products/featured").then((r) => setFeatured(r.data));
  }, []);

  return (
    <section className="space-y-6">

      <HeroBanner />
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

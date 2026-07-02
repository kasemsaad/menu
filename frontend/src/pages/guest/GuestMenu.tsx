import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import type { Category, Offer, Product } from "@/types";
import { t as loc } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";

export const GuestMenu = () => {
  const { basePath } = useOutletContext<{ basePath: string }>();
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [active, setActive] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/categories").then((r) => {
      setCategories(r.data);
      if (r.data[0]) setActive(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (active) params.categoryId = active;
    if (search) params.search = search;
    api.get("/products", { params }).then((r) => setProducts(r.data));
  }, [active, search]);

  useEffect(() => {
    api.get("/offers").then((r) => setOffers(r.data));
  }, []);

  return (
    <section className="space-y-4">
      <input
        className="input-field"
        placeholder={t("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <section className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActive("")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${!active ? "bg-brand-solid" : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200"}`}
        >
          {t("allCategories")}
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            type="button"
            onClick={() => setActive(c._id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${active === c._id ? "bg-brand-solid" : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200"}`}
          >
            {loc(c.name, i18n.language)}
          </button>
        ))}
      </section>
      <section className="space-y-3">
        {products.map((p) => {
          const productOffer = offers.find((offer) =>
            offer.productIds.some((id) =>
              typeof id === "string" ? id === p._id : id._id === p._id
            )
          );
          return (
            <ProductCard
              key={p._id}
              product={p}
              basePath={basePath}
              offer={productOffer}
            />
          );
        })}
      </section>
    </section>
  );
};

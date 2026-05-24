import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Minus, Plus, Star } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { Product, Addon } from "@/types";
import { t as loc, formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

export const ProductDetail = () => {
  const { id } = useParams();
  const { basePath } = useOutletContext<{ basePath: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data));
  }, [id]);

  if (!product) return null;

  const lang = i18n.language;
  const toggleAddon = (a: Addon) => {
    setSelectedAddons((prev) =>
      prev.some((x) => x.name.en === a.name.en)
        ? prev.filter((x) => x.name.en !== a.name.en)
        : [...prev, a]
    );
  };

  const defaultCoffeeAddons: Addon[] = [
    { name: { en: "Extra shot", ar: "شوت إضافي" }, price: 10 },
    { name: { en: "Oat milk", ar: "حليب شوفان" }, price: 8 },
  ];

  const productName = loc(product.name, "en").toLowerCase();
  const isCoffeeProduct = /(cappuccino|latte|mocha|espresso|coffee|americano)/.test(productName);
  const visibleAddons = isCoffeeProduct
    ? [...product.addons, ...defaultCoffeeAddons].filter(
        (a, index, list) => index === list.findIndex((x) => x.name.en === a.name.en)
      )
    : product.addons;

  const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const lineTotal = (product.price + addonTotal) * qty;

  const submitRating = async () => {
    try {
      await api.post(`/products/${id}/reviews`, {
        rating,
        tableNumber: sessionStorage.getItem("tableNumber"),
      });
      showToast(t("thanksRating"), "success");
    } catch {
      /* global toast */
    }
  };

  return (
    <section className="space-y-5">
      <section className="flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30">
        {product.image ? (
          <img src={product.image} alt="" className="h-full w-full rounded-2xl object-cover" />
        ) : (
          <span className="font-display text-5xl text-brand-600">{loc(product.name, lang).charAt(0)}</span>
        )}
      </section>
      <section>
        <h1 className="font-display text-2xl font-bold">{loc(product.name, lang)}</h1>
        {product.description && (
          <p className="mt-2 text-stone-500">{loc(product.description, lang)}</p>
        )}
        <p className="mt-2 text-2xl font-bold text-brand-600">{formatPrice(product.price)}</p>
        {product.ratingCount > 0 && (
          <p className="mt-1 flex items-center gap-1 text-amber-500">
            <Star size={16} fill="currentColor" /> {product.rating} ({product.ratingCount})
          </p>
        )}
      </section>
      {visibleAddons?.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">{t("addons")}</h3>
          <p className="text-sm text-stone-500">{t("selectOptionalAddons")}</p>
          <section className="space-y-2">
            {visibleAddons.map((a) => (
              <label
                key={a.name.en}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 p-3 dark:border-stone-700"
              >
                <span>
                  <input
                    type="checkbox"
                    checked={selectedAddons.some((x) => x.name.en === a.name.en)}
                    onChange={() => toggleAddon(a)}
                    className="me-2"
                  />
                  {loc(a.name, lang)}
                </span>
                <span className="text-sm text-brand-600">+{formatPrice(a.price)}</span>
              </label>
            ))}
          </section>
        </section>
      )}
      <section>
        <label className="text-sm font-medium">{t("notes")}</label>
        <textarea id="notes" className="input-field mt-1" rows={2} />
      </section>
      <section className="flex items-center justify-between">
        <span className="font-medium">{t("quantity")}</span>
        <section className="flex items-center gap-3">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="rounded-lg bg-stone-100 p-2 dark:bg-stone-800">
            <Minus size={18} />
          </button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button type="button" onClick={() => setQty(qty + 1)} className="rounded-lg bg-stone-100 p-2 dark:bg-stone-800">
            <Plus size={18} />
          </button>
        </section>
      </section>
      <button
        type="button"
        className="btn-primary w-full"
        onClick={() => {
          const notes = (document.getElementById("notes") as HTMLTextAreaElement)?.value;
          addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: qty,
            notes,
            addons: selectedAddons,
          });
          navigate(`${basePath}/cart`);
        }}
      >
        {t("addToCart")} — {formatPrice(lineTotal)}
      </button>
      <section className="card">
        <h3 className="font-semibold">{t("rateProduct")}</h3>
        <section className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star size={24} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
            </button>
          ))}
        </section>
        <button type="button" className="btn-outline mt-3 w-full" onClick={submitRating}>
          Submit
        </button>
      </section>
    </section>
  );
};

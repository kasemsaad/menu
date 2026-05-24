import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import type { Product } from "@/types";
import { useTranslation } from "react-i18next";

export const ProductDetailModal = ({
  productId,
  onClose,
}: {
  productId: string | undefined;
  onClose: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api
      .get(`/products/${productId}`)
      .then((r) => setProduct(r.data))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-w-lg rounded-xl bg-white p-4 dark:bg-stone-900">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{product ? (product.name[i18n.language as "en" | "ar"] ?? product.name.en) : t("loading")}</h3>
          <button type="button" className="rounded p-1 text-stone-600" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {loading && <p className="text-sm text-stone-500">{t("loading")}…</p>}
          {!loading && product && (
            <>
              {product.image && <img src={product.image} alt="" className="h-40 w-full rounded object-cover" />}
              <p className="text-sm text-stone-600">{product.description?.[i18n.language as "en" | "ar"] ?? product.description?.en}</p>
              <p className="text-sm text-stone-500">{t("price")} : {product.price} EGP</p>
              {product.addons?.length > 0 && (
                <div>
                  <p className="font-medium text-sm">{t("addons")}:</p>
                  <ul className="text-sm text-stone-500 pl-4">
                    {product.addons.map((a, i) => (
                      <li key={i}>{a.name[i18n.language as "en" | "ar"] ?? a.name.en} (+{a.price})</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import { Link } from "react-router-dom";
import { Star, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Offer, Product } from "@/types";
import { t as loc, formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
  basePath: string;
  offer?: Offer;
}

export const ProductCard = ({ product, basePath, offer }: Props) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const discountedPrice = offer
    ? Math.round(product.price * (1 - offer.discountPercent / 100))
    : product.price;

  return (
    <Link
      to={`${basePath}/product/${product._id}`}
      className="card group flex gap-4 transition hover:shadow-lg hover:ring-1 hover:ring-brand-200 dark:hover:ring-brand-800"
    >
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-brand-800/40">
        {product.image ? (
          <img src={product.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-2xl text-brand-600">
            {loc(product.name, lang).charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-stone-900 group-hover:text-brand dark:text-white">
            {loc(product.name, lang)}
          </h3>
          {offer && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              -{offer.discountPercent}%
            </span>
          )}
        </div>
        {product.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">
            {loc(product.description, lang)}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {offer ? (
              <>
                <span className="text-sm text-stone-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="font-bold text-brand-600">{formatPrice(discountedPrice)}</span>
              </>
            ) : (
              <span className="font-bold text-brand-600">{formatPrice(product.price)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {product.ratingCount > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                <Star size={12} fill="currentColor" />
                {product.rating}
              </span>
            )}
            <span className="rounded-lg bg-brand-600 p-1.5 text-white">
              <Plus size={16} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};


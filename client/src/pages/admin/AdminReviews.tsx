import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field } from "formik";
import { Pencil, Trash2, Star } from "lucide-react";
import api from "@/lib/api";
import type { Review } from "@/types";
import { useToast } from "@/hooks/useToast";
import { t as loc } from "@/lib/utils";

const productName = (productId: Review["productId"], lang: string) => {
  if (!productId || typeof productId === "string") return "—";
  return loc(productId.name, lang);
};

type EditForm = { rating: number; comment: string; tableNumber: string };

export const AdminReviews = () => {
  const { t, i18n } = useTranslation();
  const { showToast, showError } = useToast();
  const [items, setItems] = useState<Review[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get<Review[]>("/reviews").then((r) => setItems(r.data)).catch(showError);
  }, [showError]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string) => {
    if (!confirm(t("deleteReviewConfirm"))) return;
    try {
      await api.delete(`/reviews/${id}`);
      showToast(t("saved"), "success");
      load();
    } catch (e) {
      showError(e);
    }
  };

  const lang = i18n.language;

  return (
    <section className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("reviews")}</h1>
      <p className="text-sm text-stone-500">{t("reviewsHint")}</p>

      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item._id} className="card space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold">{productName(item.productId, lang)}</p>
                <p className="flex items-center gap-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  {item.rating}/5
                </p>
                {item.comment && <p className="text-sm text-stone-600 dark:text-stone-300">{item.comment}</p>}
                {item.tableNumber != null && (
                  <p className="text-xs text-stone-500">
                    {t("table")} {item.tableNumber}
                  </p>
                )}
                {item.createdAt && (
                  <p className="text-xs text-stone-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="btn-outline p-2"
                  onClick={() => setEditingId(editingId === item._id ? null : item._id)}
                >
                  <Pencil size={18} />
                </button>
                <button type="button" className="text-red-500" onClick={() => remove(item._id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {editingId === item._id && (
              <Formik<EditForm>
                initialValues={{
                  rating: item.rating,
                  comment: item.comment ?? "",
                  tableNumber: item.tableNumber != null ? String(item.tableNumber) : "",
                }}
                enableReinitialize
                onSubmit={async (v, { setSubmitting }) => {
                  try {
                    await api.patch(`/reviews/${item._id}`, {
                      rating: Number(v.rating),
                      comment: v.comment,
                      tableNumber: v.tableNumber === "" ? undefined : Number(v.tableNumber),
                    });
                    setEditingId(null);
                    showToast(t("saved"), "success");
                    load();
                  } catch (e) {
                    showError(e);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form className="grid gap-3 border-t border-stone-200 pt-3 dark:border-stone-700">
                    <label className="text-sm">
                      {t("rating")}
                      <Field name="rating" type="number" min={1} max={5} className="input-field mt-1" />
                    </label>
                    <label className="text-sm">
                      {t("comment")}
                      <Field name="comment" as="textarea" rows={2} className="input-field mt-1" />
                    </label>
                    <label className="text-sm">
                      {t("table")}
                      <Field name="tableNumber" type="number" min={1} className="input-field mt-1" />
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {t("save")}
                      </button>
                      <button type="button" className="btn-outline" onClick={() => setEditingId(null)}>
                        {t("cancel")}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </article>
        ))}
        {!items.length && <p className="text-stone-500">{t("noReviews")}</p>}
      </div>
    </section>
  );
};

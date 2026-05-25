import { useEffect, useState, type ChangeEvent } from "react";
import { Formik, Form } from "formik";
import { useTranslation } from "react-i18next";
import { Trash2, ImagePlus } from "lucide-react";
import api from "@/lib/api";
import { readFileAsDataUrl } from "@/lib/upload";
import type { Banner } from "@/types";
import { useToast } from "@/hooks/useToast";

const emptyBanner = (): Partial<Banner> => ({
  title: { en: "", ar: "" },
  subtitle: { en: "", ar: "" },
  description: { en: "", ar: "" },
  image: "",
  buttonText: { en: "", ar: "" },
  buttonLink: "",
  isActive: true,
  isFeatured: false,
  order: 0,
});

export const AdminBanners = () => {
  const { t } = useTranslation();
  const { showToast, showError } = useToast();
  const [items, setItems] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  const load = async () => {
    try {
      const res = await api.get<Banner[]> ("/banners/all");
      setItems(res.data || []);
    } catch (err) {
      showError(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (values: Partial<Banner>) => {
    try {
      if (values._id) {
        await api.patch(`/banners/${values._id}`, values);
        showToast(t("saved"), "success");
      } else {
        await api.post("/banners", values);
        showToast(t("created"), "success");
      }
      setEditing(null);
      await load();
    } catch (err) {
      showError(err);
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    if (!confirm(t("areYouSure"))) return;
    try {
      await api.delete(`/banners/${id}`);
      showToast(t("deleted"), "success");
      await load();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t("banners")}</h1>
        <div>
          <button className="btn" onClick={() => setEditing(emptyBanner())}>
            {t("create")}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((it) => (
          <div key={it._id} className="card flex items-center justify-between">
            <div className="flex items-center gap-4">
              {it.image ? (
                <img src={it.image} alt="" className="h-16 w-24 rounded-md object-cover" />
              ) : (
                <div className="h-16 w-24 rounded-md bg-stone-100" />
              )}
              <div>
                <div className="font-medium">{it.title?.en || it.title?.ar}</div>
                <div className="text-sm text-stone-500">{it.subtitle?.en}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-ghost" onClick={() => setEditing(it)}>
                {t("edit")}
              </button>
              <button className="btn-ghost text-red-600" onClick={() => remove(it._id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="card">
          <Formik initialValues={editing} enableReinitialize onSubmit={save}>
            {({ values, setFieldValue }) => (
              <Form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("titleEn")}</span>
                    <input
                      className="input-field"
                      value={(values.title as any)?.en || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFieldValue("title", { ...(values.title || {}), en: e.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("titleAr")}</span>
                    <input
                      className="input-field"
                      value={(values.title as any)?.ar || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFieldValue("title", { ...(values.title || {}), ar: e.target.value })
                      }
                    />
                  </label>
                </div>

                <label className="space-y-1 text-sm">
                  <span className="font-medium">{t("image")}</span>
                  <div className="flex items-center gap-4">
                    {values.image ? (
                      <img src={values.image as string} className="h-28 w-48 object-cover rounded-md" />
                    ) : (
                      <div className="h-28 w-48 rounded-md bg-stone-100 flex items-center justify-center text-stone-400">
                        <ImagePlus />
                      </div>
                    )}
                    <label className="btn-outline cursor-pointer text-sm">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) setFieldValue("image", await readFileAsDataUrl(f));
                        }}
                      />
                      {t("upload")}
                    </label>
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <label className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!values.isActive}
                        onChange={(e) => setFieldValue("isActive", e.target.checked)}
                      />
                      <span>{t("isActive")}</span>
                    </div>
                  </label>
                  <label className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!values.isFeatured}
                        onChange={(e) => setFieldValue("isFeatured", e.target.checked)}
                      />
                      <span>{t("isFeatured")}</span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn" type="submit">
                    {t("save")}
                  </button>
                  <button className="btn-ghost" type="button" onClick={() => setEditing(null)}>
                    {t("cancel")}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </section>
  );
};

export default AdminBanners;

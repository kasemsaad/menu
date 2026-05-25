import { useEffect, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field, FieldArray } from "formik";
import api from "@/lib/api";
import type { AdminUser, Category, Coupon, Offer, Product, TableInfo, UserRole } from "@/types";
import { QrCode, Plus, Trash2, Pencil, ImagePlus, Users, Ticket, Receipt, Tag } from "lucide-react";
import { TableCheckModal } from "@/components/TableCheckModal";

type Resource = "categories" | "products" | "tables" | "users" | "coupons" | "offers";

const endpoints: Record<Resource, string> = {
  categories: "/categories/all",
  products: "/products/all",
  tables: "/tables",
  users: "/users",
  coupons: "/coupons",
  offers: "/offers/all",
};

type CategoryForm = {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
};

type AddonFormRow = {
  nameEn: string;
  nameAr: string;
  price: number;
};

type ProductForm = {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  categoryId: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  addons: AddonFormRow[];
};

const emptyCategory: CategoryForm = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

const emptyProduct: ProductForm = {
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  price: 0,
  categoryId: "",
  image: "",
  isAvailable: true,
  isFeatured: false,
  addons: [],
};

type TableForm = {
  number: number;
  capacity: number;
  status: TableInfo["status"];
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
};

type CouponForm = {
  code: string;
  discountType: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
};

type OfferForm = {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  discountPercent: number;
  productIds: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const emptyTable: TableForm = { number: 1, capacity: 4, status: "available" };
const emptyOffer: OfferForm = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  image: "",
  discountPercent: 10,
  productIds: [],
  startsAt: new Date().toISOString().slice(0, 10),
  endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true,
};

const emptyUser: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "waiter",
  phone: "",
  isActive: true,
};

const emptyCoupon: CouponForm = {
  code: "",
  discountType: "percent",
  value: 10,
  minOrder: 0,
  maxUses: 100,
  expiresAt: "",
  isActive: true,
};

const ROLES: UserRole[] = ["admin", "chef", "waiter", "delivery"];

const TABLE_STATUSES: TableInfo["status"][] = ["available", "occupied", "needs_bill"];

const statusClass = (status: TableInfo["status"]) => {
  if (status === "available") return "bg-green-100 text-green-700";
  if (status === "occupied") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
};

const tableToForm = (t: TableInfo): TableForm => ({
  number: t.number ?? 1,
  capacity: t.capacity ?? 4,
  status: t.status ?? "available",
});

const userToForm = (u: AdminUser): UserForm => ({
  name: u.name,
  email: u.email,
  password: "",
  role: u.role,
  phone: u.phone ?? "",
  isActive: u.isActive,
});

const couponToForm = (c: Coupon): CouponForm => ({
  code: c.code,
  discountType: c.discountType,
  value: c.value,
  minOrder: c.minOrder,
  maxUses: c.maxUses,
  expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
  isActive: c.isActive,
});

const offerToForm = (o: Offer): OfferForm => ({
  titleEn: o.title.en,
  titleAr: o.title.ar,
  descriptionEn: o.description?.en ?? "",
  descriptionAr: o.description?.ar ?? "",
  image: o.image ?? "",
  discountPercent: o.discountPercent,
  productIds: (o.productIds ?? []).map((id) => (typeof id === "string" ? id : id._id)),
  startsAt: o.startsAt ? o.startsAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  endsAt: o.endsAt ? o.endsAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  isActive: o.isActive,
});

const buildTablePayload = (v: TableForm) => ({
  number: Number(v.number),
  capacity: Number(v.capacity),
  status: v.status,
});

const buildUserPayload = (v: UserForm, isEdit: boolean) => {
  const payload: Record<string, unknown> = {
    name: v.name,
    email: v.email,
    role: v.role,
    phone: v.phone || undefined,
    isActive: v.isActive,
  };
  if (v.password || !isEdit) payload.password = v.password;
  return payload;
};

const buildCouponPayload = (v: CouponForm) => ({
  code: v.code.toUpperCase(),
  discountType: v.discountType,
  value: Number(v.value),
  minOrder: Number(v.minOrder),
  maxUses: Number(v.maxUses),
  expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString() : undefined,
  isActive: v.isActive,
});

const buildOfferPayload = (v: OfferForm) => ({
  title: { en: v.titleEn, ar: v.titleAr },
  description:
    v.descriptionEn || v.descriptionAr
      ? { en: v.descriptionEn, ar: v.descriptionAr }
      : undefined,
  image: v.image || undefined,
  discountPercent: Number(v.discountPercent),
  productIds: v.productIds.filter(Boolean),
  startsAt: new Date(v.startsAt).toISOString(),
  endsAt: new Date(v.endsAt).toISOString(),
  isActive: v.isActive,
});

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const locName = (name?: { en?: string; ar?: string }) => ({
  en: name?.en ?? "",
  ar: name?.ar ?? "",
});

const categoryToForm = (c: Category): CategoryForm => {
  const name = locName(c.name);
  return {
    nameEn: name.en,
    nameAr: name.ar,
    descriptionEn: c.description?.en ?? "",
    descriptionAr: c.description?.ar ?? "",
    image: c.image ?? "",
    sortOrder: c.sortOrder ?? 0,
    isActive: c.isActive ?? true,
  };
};

const productToForm = (p: Product): ProductForm => {
  const name = locName(p.name);
  const categoryId =
    typeof p.categoryId === "object" ? p.categoryId._id : String(p.categoryId ?? "");
  return {
    nameEn: name.en,
    nameAr: name.ar,
    descriptionEn: p.description?.en ?? "",
    descriptionAr: p.description?.ar ?? "",
    price: p.price,
    categoryId,
    image: p.image ?? "",
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    addons: (p.addons ?? []).map((a) => ({
      nameEn: a.name?.en ?? "",
      nameAr: a.name?.ar ?? "",
      price: a.price ?? 0,
    })),
  };
};

const buildCategoryPayload = (v: CategoryForm) => ({
  name: { en: v.nameEn, ar: v.nameAr },
  description:
    v.descriptionEn || v.descriptionAr
      ? { en: v.descriptionEn, ar: v.descriptionAr }
      : undefined,
  image: v.image || undefined,
  sortOrder: Number(v.sortOrder),
  isActive: v.isActive,
});

const buildProductPayload = (v: ProductForm) => ({
  name: { en: v.nameEn, ar: v.nameAr },
  description:
    v.descriptionEn || v.descriptionAr
      ? { en: v.descriptionEn, ar: v.descriptionAr }
      : undefined,
  price: Number(v.price),
  categoryId: v.categoryId,
  image: v.image || undefined,
  isAvailable: v.isAvailable,
  isFeatured: v.isFeatured,
  addons: v.addons
    .filter((a) => a.nameEn.trim() || a.nameAr.trim())
    .map((a) => ({
      name: { en: a.nameEn.trim(), ar: a.nameAr.trim() },
      price: Number(a.price) || 0,
    })),
});

const ImageField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) => (
  <div className="flex flex-col gap-2 sm:col-span-2">
    <div className="flex items-center gap-3">
      {value ? (
        <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-stone-200" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-stone-100 text-stone-400 dark:bg-stone-800">
          <ImagePlus size={24} />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2">
        <input
          type="text"
          placeholder="Image URL"
          className="input-field"
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
        <label className="btn-outline cursor-pointer text-center text-sm">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) onChange(await readFileAsDataUrl(file));
            }}
          />
          Upload image
        </label>
      </div>
    </div>
  </div>
);

const LocalizedRow = ({
  nameEn,
  nameAr,
  descriptionEn,
  descriptionAr,
}: {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
}) => (
  <div className="min-w-0 flex-1 space-y-1 text-sm">
    <p>
      <span className="font-medium text-stone-500">EN:</span> {nameEn}
    </p>
    <p>
      <span className="font-medium text-stone-500">AR:</span> {nameAr}
    </p>
    {(descriptionEn || descriptionAr) && (
      <>
        {descriptionEn && (
          <p className="text-xs text-stone-500">
            <span className="font-medium">Desc EN:</span> {descriptionEn}
          </p>
        )}
        {descriptionAr && (
          <p className="text-xs text-stone-500">
            <span className="font-medium">Desc AR:</span> {descriptionAr}
          </p>
        )}
      </>
    )}
  </div>
);

const CategoryFormFields = ({
  values,
  setFieldValue,
}: {
  values: CategoryForm;
  setFieldValue: (field: string, value: unknown) => void;
}) => (
  <>
    <Field name="nameEn" placeholder="Name EN" className="input-field" />
    <Field name="nameAr" placeholder="Name AR" className="input-field" />
    <Field name="descriptionEn" placeholder="Description EN" className="input-field" />
    <Field name="descriptionAr" placeholder="Description AR" className="input-field" />
    <Field name="sortOrder" type="number" className="input-field" placeholder="Sort order" />
    <label className="flex items-center gap-2 text-sm">
      <Field type="checkbox" name="isActive" />
      Active
    </label>
    <ImageField value={values.image} onChange={(url) => setFieldValue("image", url)} />
  </>
);

const ProductFormFields = ({
  values,
  setFieldValue,
  categories,
}: {
  values: ProductForm;
  setFieldValue: (field: string, value: unknown) => void;
  categories: Category[];
}) => (
  <>
    <Field name="nameEn" placeholder="Name EN" className="input-field" />
    <Field name="nameAr" placeholder="Name AR" className="input-field" />
    <Field name="descriptionEn" placeholder="Description EN" className="input-field" />
    <Field name="descriptionAr" placeholder="Description AR" className="input-field" />
    <Field name="price" type="number" className="input-field" placeholder="Price" />
    <Field as="select" name="categoryId" className="input-field">
      <option value="">Select category</option>
      {categories.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name.en} / {c.name.ar}
        </option>
      ))}
    </Field>
    <label className="flex items-center gap-2 text-sm">
      <Field type="checkbox" name="isAvailable" />
      Available
    </label>
    <label className="flex items-center gap-2 text-sm">
      <Field type="checkbox" name="isFeatured" />
      Featured
    </label>
    <ImageField value={values.image} onChange={(url) => setFieldValue("image", url)} />
    <AddonFormFields />
  </>
);

const AddonFormFields = () => {
  const { t } = useTranslation();
  return (
    <FieldArray name="addons">
      {({ push, remove, form }) => (
        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-medium">{t("addons")}</p>
          {(form.values as ProductForm).addons.map((_, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-4">
              <Field name={`addons.${i}.nameEn`} placeholder="Addon EN" className="input-field" />
              <Field name={`addons.${i}.nameAr`} placeholder="Addon AR" className="input-field" />
              <Field name={`addons.${i}.price`} type="number" min={0} className="input-field" placeholder="Price" />
              <button type="button" className="text-sm text-red-500" onClick={() => remove(i)}>
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-outline text-sm"
            onClick={() => push({ nameEn: "", nameAr: "", price: 0 })}
          >
            + Add addon
          </button>
        </div>
      )}
    </FieldArray>
  );
};

const TableFormFields = () => (
  <>
    <Field name="number" type="number" min={1} className="input-field" placeholder="Table number" />
    <Field name="capacity" type="number" min={1} className="input-field" placeholder="Capacity" />
    <Field as="select" name="status" className="input-field">
      {TABLE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </Field>
  </>
);

const UserFormFields = ({ isEdit }: { isEdit?: boolean }) => (
  <>
    <Field name="name" placeholder="Name" className="input-field" />
    <Field name="email" type="email" placeholder="Email" className="input-field" />
    <Field
      name="password"
      type="password"
      placeholder={isEdit ? "New password (optional)" : "Password"}
      className="input-field"
    />
    <Field as="select" name="role" className="input-field">
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </Field>
    <Field name="phone" placeholder="Phone" className="input-field" />
    <label className="flex items-center gap-2 text-sm">
      <Field type="checkbox" name="isActive" />
      Active
    </label>
  </>
);

const OfferFormFields = ({
  values,
  setFieldValue,
  products,
}: {
  values: OfferForm;
  setFieldValue: (field: string, value: unknown) => void;
  products: Product[];
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Field name="titleEn" placeholder="Title EN" className="input-field" />
      <Field name="titleAr" placeholder="Title AR" className="input-field" />
      <Field name="descriptionEn" placeholder="Description EN" className="input-field" />
      <Field name="descriptionAr" placeholder="Description AR" className="input-field" />
      <Field name="discountPercent" type="number" className="input-field" placeholder="Discount %" />
      <ImageField value={values.image} onChange={(url) => setFieldValue("image", url)} />
      <label className="space-y-2 text-sm sm:col-span-2">
        <span className="font-medium">{t("products")}</span>
        <select
          name="productIds"
          multiple
          aria-label={t("products")}
          className="input-field h-40 rounded-xl"
          value={values.productIds}
          onChange={(event) => {
            const selectedValues = Array.from(event.target.selectedOptions).map((option) => option.value);
            setFieldValue("productIds", selectedValues);
          }}
        >
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name.en} / {product.name.ar}
            </option>
          ))}
        </select>
        {values.productIds.length > 0 ? (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 dark:border-stone-700 dark:bg-stone-900">
            <p className="font-semibold text-stone-700 dark:text-stone-200">{t("selectedProducts")}</p>
            <ul className="mt-2 space-y-1">
              {values.productIds.map((id) => {
                const product = products.find((product) => product._id === id);
                return (
                  <li key={id} className="truncate">
                    {product ? `${product.name.en} / ${product.name.ar}` : id}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-stone-500">{t("selectProductsHint")}</p>
        )}
      </label>
      <Field name="startsAt" type="date" className="input-field" />
      <Field name="endsAt" type="date" className="input-field" />
      <label className="flex items-center gap-2 text-sm">
        <Field type="checkbox" name="isActive" />
        {t("active")}
      </label>
    </>
  );
};

const CouponFormFields = () => {
  const { t } = useTranslation();

  return (
    <>
      <label className="space-y-2 text-sm">
        <span className="font-medium">{t("code")}</span>
        <Field name="code" placeholder={t("code") as string} className="input-field uppercase" />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium">{t("discountType")}</span>
        <Field as="select" name="discountType" className="input-field">
          <option value="percent">{t("percent")}</option>
          <option value="fixed">{t("fixedAmount")}</option>
        </Field>
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium">{t("value")}</span>
        <Field name="value" type="number" min={0} className="input-field" placeholder={t("value") as string} />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium">{t("minOrder")}</span>
        <Field name="minOrder" type="number" min={0} className="input-field" placeholder={t("minOrder") as string} />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium">{t("maxUses")}</span>
        <Field name="maxUses" type="number" min={1} className="input-field" placeholder={t("maxUses") as string} />
      </label>
      <label className="space-y-2 text-sm">
        <span className="font-medium">{t("expiresAt")}</span>
        <Field name="expiresAt" type="date" className="input-field" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Field type="checkbox" name="isActive" />
        {t("active")}
      </label>
    </>
  );
};

const EditFormActions = ({
  onCancel,
  isSubmitting,
}: {
  onCancel: () => void;
  isSubmitting?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 sm:col-span-2">
      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {t("save")}
      </button>
      <button type="button" className="btn-outline" onClick={onCancel}>
        {t("cancel")}
      </button>
    </div>
  );
};

export const AdminCrud = ({ resource }: { resource: Resource }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [checkTableId, setCheckTableId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const load = () => api.get(endpoints[resource]).then((r) => setItems(r.data));

  useEffect(() => {
    setItems([]);
    setEditingId(null);
    load();
  }, [resource]);

  useEffect(() => {
    if (resource === "products") {
      api.get("/categories/all").then((r) => setCategories(r.data));
    }
    if (resource === "offers") {
      api.get("/products/all").then((r) => setProducts(r.data));
    }
  }, [resource]);

  const remove = async (id: string) => {
    const base = resource === "categories" ? "/categories" : `/${resource}`;
    await api.delete(`${base}/${id}`);
    if (editingId === id) setEditingId(null);
    load();
  };

  const generateTable = async () => {
    const num = items.length + 1;
    const { data } = await api.post("/tables", { number: num, capacity: 4 });
    setQrPreview(data.qrImage);
    load();
  };

  const showQr = async (id: string) => {
    const { data } = await api.get(`/tables/${id}/qr`);
    setQrPreview(data.qrImage);
  };

  const renderCategoryItem = (item: Category) => (
    <article key={item._id} className="card space-y-3">
      <div className="flex gap-4">
        {item.image ? (
          <img src={item.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 dark:bg-stone-800">
            <ImagePlus size={28} />
          </div>
        )}
        <LocalizedRow
          nameEn={item.name?.en ?? ""}
          nameAr={item.name?.ar ?? ""}
          descriptionEn={item.description?.en}
          descriptionAr={item.description?.ar}
        />
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-xs text-stone-500">Order: {item.sortOrder}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
          <div className="flex gap-2">
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
      </div>
      {editingId === item._id && (
        <Formik
          initialValues={categoryToForm(item)}
          enableReinitialize
          onSubmit={async (v, { setSubmitting }) => {
            await api.patch(`/categories/${item._id}`, buildCategoryPayload(v));
            setEditingId(null);
            setSubmitting(false);
            load();
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="grid gap-3 border-t border-stone-200 pt-3 sm:grid-cols-2 dark:border-stone-700">
              <CategoryFormFields values={values} setFieldValue={setFieldValue} />
              <div className="flex gap-2 sm:col-span-2">
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
  );

  const renderProductItem = (item: Product) => {
    const catName =
      typeof item.categoryId === "object" ? item.categoryId.name : undefined;
    return (
      <article key={item._id} className="card space-y-3">
        <div className="flex gap-4">
          {item.image ? (
            <img src={item.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 dark:bg-stone-800">
              <ImagePlus size={28} />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <LocalizedRow
              nameEn={item.name?.en ?? ""}
              nameAr={item.name?.ar ?? ""}
              descriptionEn={item.description?.en}
              descriptionAr={item.description?.ar}
            />
            <p className="font-bold text-brand-600">{item.price ?? 0} EGP</p>
            {catName && (
              <p className="text-xs text-stone-500">
                {catName.en ?? ""} / {catName.ar ?? ""}
              </p>
            )}
            <div className="flex gap-2 text-xs">
              {item.isFeatured && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{t("featured")}</span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 ${item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
            {item.addons?.length > 0 && (
              <p className="text-xs text-stone-500">
                {t("addons")}: {item.addons.map((a) => `${a.name.en} (+${a.price})`).join(" · ")}
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
          <Formik
            initialValues={productToForm(item)}
            enableReinitialize
            onSubmit={async (v, { setSubmitting }) => {
              await api.patch(`/products/${item._id}`, buildProductPayload(v));
              setEditingId(null);
              setSubmitting(false);
              load();
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="grid gap-3 border-t border-stone-200 pt-3 sm:grid-cols-2 dark:border-stone-700">
                <ProductFormFields
                  values={values}
                  setFieldValue={setFieldValue}
                  categories={categories}
                />
                <div className="flex gap-2 sm:col-span-2">
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
    );
  };

  const renderTableItem = (item: TableInfo) => {
    const status = item.status ?? "available";
    return (
    <article key={item._id} className="card space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 font-display text-xl font-bold text-brand-700 dark:bg-brand-900/40">
          {item.number}
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="font-semibold">
            {t("table")} #{item.number}
          </p>
          <p className="text-stone-500">Capacity: {item.capacity ?? 4}</p>
          <p className="truncate text-xs text-stone-400">QR: {item.qrCode ?? "—"}</p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs capitalize ${statusClass(status)}`}>
            {status.replace("_", " ")}
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="btn-outline p-2"
            onClick={() => setCheckTableId(item._id)}
            title={t("tableCheck")}
          >
            <Receipt size={18} />
          </button>
          <button type="button" className="btn-outline p-2" onClick={() => showQr(item._id)} title="QR">
            <QrCode size={18} />
          </button>
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
        <Formik
          initialValues={tableToForm(item)}
          enableReinitialize
          onSubmit={async (v, { setSubmitting }) => {
            await api.patch(`/tables/${item._id}`, buildTablePayload(v));
            setEditingId(null);
            setSubmitting(false);
            load();
          }}
        >
          {({ isSubmitting }) => (
            <Form className="grid gap-3 border-t border-stone-200 pt-3 sm:grid-cols-3 dark:border-stone-700">
              <TableFormFields />
              <EditFormActions onCancel={() => setEditingId(null)} isSubmitting={isSubmitting} />
            </Form>
          )}
        </Formik>
      )}
    </article>
    );
  };

  const renderUserItem = (item: AdminUser) => (
    <article key={item._id} className="card space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-500 dark:bg-stone-800">
          <Users size={24} />
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="font-semibold">{item.name}</p>
          <p className="text-stone-500">{item.email}</p>
          {item.phone && <p className="text-stone-500">{item.phone}</p>}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs capitalize text-brand-700">
              {item.role}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}
            >
              {item.isActive ? "Active" : "Inactive"}
            </span>
          </div>
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
        <Formik
          initialValues={userToForm(item)}
          enableReinitialize
          onSubmit={async (v, { setSubmitting }) => {
            await api.patch(`/users/${item._id}`, buildUserPayload(v, true));
            setEditingId(null);
            setSubmitting(false);
            load();
          }}
        >
          {({ isSubmitting }) => (
            <Form className="grid gap-3 border-t border-stone-200 pt-3 sm:grid-cols-2 dark:border-stone-700">
              <UserFormFields isEdit />
              <EditFormActions onCancel={() => setEditingId(null)} isSubmitting={isSubmitting} />
            </Form>
          )}
        </Formik>
      )}
    </article>
  );

  const renderOfferItem = (item: Offer) => {
    const titleLabel = item.title?.en || item.title?.ar || t("offer");
    const subtitleLabel = item.title?.ar
      ? `${item.title?.en || item.title?.ar} / ${item.title.ar}`
      : titleLabel;

    return (
      <article key={item._id} className="card space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {item.image ? (
            <img
              src={item.image}
              alt={titleLabel}
              className="h-28 w-full rounded-2xl object-cover lg:h-20 lg:w-20"
            />
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 lg:h-20 lg:w-20">
              <Tag size={24} />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p className="font-semibold">{subtitleLabel}</p>
            {item.description?.en && (
              <p className="text-stone-500 text-sm">{item.description.en}</p>
            )}
            {item.description?.ar && (
              <p className="text-stone-500 text-sm">{item.description.ar}</p>
            )}
            <p className="text-stone-500">
              -{item.discountPercent}% · {item.productIds?.length ?? 0} products
            </p>
            <p className="text-xs text-stone-400">
              {new Date(item.startsAt).toLocaleDateString()} — {new Date(item.endsAt).toLocaleDateString()}
            </p>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}
            >
              {item.isActive ? "Active" : "Inactive"}
            </span>
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
          <Formik
            initialValues={offerToForm(item)}
            enableReinitialize
            onSubmit={async (v, { setSubmitting }) => {
              await api.patch(`/offers/${item._id}`, buildOfferPayload(v));
              setEditingId(null);
              setSubmitting(false);
              load();
            }}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="grid gap-3 border-t border-stone-200 pt-3 sm:grid-cols-2 dark:border-stone-700">
                <OfferFormFields values={values} setFieldValue={setFieldValue} products={products} />
                <EditFormActions onCancel={() => setEditingId(null)} isSubmitting={isSubmitting} />
              </Form>
            )}
          </Formik>
        )}
      </article>
    );
  };

  const renderCouponItem = (item: Coupon) => (
    <article key={item._id} className="card space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40">
          <Ticket size={24} />
        </div>
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="font-mono font-bold tracking-wide">{item.code}</p>
          <p className="text-stone-500">
            {item.discountType === "percent" ? `${item.value}%` : `${item.value} EGP`} off
            {item.minOrder > 0 && ` · Min ${item.minOrder} EGP`}
          </p>
          <p className="text-xs text-stone-500">
            Uses: {item.usedCount} / {item.maxUses}
          </p>
          {item.expiresAt && (
            <p className="text-xs text-stone-400">
              Expires: {new Date(item.expiresAt).toLocaleDateString()}
            </p>
          )}
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
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
        <Formik
          initialValues={couponToForm(item)}
          enableReinitialize
          onSubmit={async (v, { setSubmitting }) => {
            await api.patch(`/coupons/${item._id}`, buildCouponPayload(v));
            setEditingId(null);
            setSubmitting(false);
            load();
          }}
        >
          {({ isSubmitting }) => (
            <Form className="grid gap-3 border-t border-stone-200 pt-3 sm:grid-cols-2 dark:border-stone-700">
              <CouponFormFields />
              <EditFormActions onCancel={() => setEditingId(null)} isSubmitting={isSubmitting} />
            </Form>
          )}
        </Formik>
      )}
    </article>
  );

  return (
    <section className="space-y-4">
      <section className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold capitalize">{t(resource)}</h1>
        {resource === "tables" && (
          <button type="button" className="btn-primary" onClick={generateTable}>
            <Plus size={18} /> {t("generateQr")}
          </button>
        )}
      </section>
      {qrPreview && (
        <section className="card flex flex-col items-center">
          <img src={qrPreview} alt="QR" className="h-48 w-48" />
          <button type="button" className="mt-2 text-sm text-stone-500" onClick={() => setQrPreview(null)}>
            Close
          </button>
        </section>
      )}
      <section className="space-y-2">
        {resource === "categories" &&
          (items as unknown as Category[]).map((item) => renderCategoryItem(item))}
        {resource === "products" &&
          (items as unknown as Product[]).map((item) => renderProductItem(item))}
        {resource === "tables" &&
          (items as unknown as TableInfo[]).map((item) => renderTableItem(item))}
        {resource === "users" &&
          (items as unknown as AdminUser[]).map((item) => renderUserItem(item))}
        {resource === "offers" &&
          (items as unknown as Offer[]).filter(Boolean).map((item) => renderOfferItem(item))}
        {resource === "coupons" &&
          (items as unknown as Coupon[]).map((item) => renderCouponItem(item))}
      </section>
      {resource === "offers" && (
        <Formik
          initialValues={emptyOffer}
          onSubmit={async (v, { resetForm }) => {
            await api.post("/offers", buildOfferPayload(v));
            resetForm();
            load();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="card grid gap-3 sm:grid-cols-2">
              <p className="font-semibold sm:col-span-2">{t("add")} {t("offers")}</p>
              <OfferFormFields values={values} setFieldValue={setFieldValue} products={products} />
              <button type="submit" className="btn-primary sm:col-span-2">
                {t("add")}
              </button>
            </Form>
          )}
        </Formik>
      )}
      {resource === "categories" && (
        <Formik
          initialValues={emptyCategory}
          onSubmit={async (v, { resetForm }) => {
            await api.post("/categories", buildCategoryPayload(v));
            resetForm();
            load();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="card grid gap-3 sm:grid-cols-2">
              <p className="font-semibold sm:col-span-2">{t("add")} {t("categories")}</p>
              <CategoryFormFields values={values} setFieldValue={setFieldValue} />
              <button type="submit" className="btn-primary sm:col-span-2">
                {t("add")}
              </button>
            </Form>
          )}
        </Formik>
      )}
      {resource === "products" && (
        <Formik
          initialValues={emptyProduct}
          onSubmit={async (v, { resetForm }) => {
            await api.post("/products", buildProductPayload(v));
            resetForm();
            load();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="card grid gap-3 sm:grid-cols-2">
              <p className="font-semibold sm:col-span-2">{t("add")} {t("products")}</p>
              <ProductFormFields values={values} setFieldValue={setFieldValue} categories={categories} />
              <button type="submit" className="btn-primary sm:col-span-2">
                {t("add")}
              </button>
            </Form>
          )}
        </Formik>
      )}
      {resource === "tables" && (
        <Formik
          initialValues={{ ...emptyTable, number: items.length + 1 }}
          enableReinitialize
          onSubmit={async (v, { resetForm }) => {
            const { data } = await api.post("/tables", buildTablePayload(v));
            if (data.qrImage) setQrPreview(data.qrImage);
            resetForm();
            load();
          }}
        >
          <Form className="card grid gap-3 sm:grid-cols-3">
            <p className="font-semibold sm:col-span-3">{t("add")} {t("tables")}</p>
            <TableFormFields />
            <button type="submit" className="btn-primary sm:col-span-3">
              {t("add")}
            </button>
          </Form>
        </Formik>
      )}
      {resource === "users" && (
        <Formik
          initialValues={emptyUser}
          onSubmit={async (v, { resetForm }) => {
            if (!v.password) return;
            await api.post("/users", buildUserPayload(v, false));
            resetForm();
            load();
          }}
        >
          <Form className="card grid gap-3 sm:grid-cols-2">
            <p className="font-semibold sm:col-span-2">{t("add")} {t("users")}</p>
            <UserFormFields />
            <button type="submit" className="btn-primary sm:col-span-2">
              {t("add")}
            </button>
          </Form>
        </Formik>
      )}
      {resource === "coupons" && (
        <Formik
          initialValues={emptyCoupon}
          onSubmit={async (v, { resetForm }) => {
            await api.post("/coupons", buildCouponPayload(v));
            resetForm();
            load();
          }}
        >
          <Form className="card grid gap-3 sm:grid-cols-2">
            <p className="font-semibold sm:col-span-2">{t("add")} {t("coupons")}</p>
            <CouponFormFields />
            <button type="submit" className="btn-primary sm:col-span-2">
              {t("add")}
            </button>
          </Form>
        </Formik>
      )}

      {resource === "tables" && (
        <TableCheckModal
          tableId={checkTableId}
          open={Boolean(checkTableId)}
          onClose={() => setCheckTableId(null)}
        />
      )}
    </section>
  );
};

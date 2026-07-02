import { useEffect, useState, type ChangeEvent } from "react";
import { Formik, Form, Field } from "formik";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Trash2, Pencil } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { CustomerUser } from "@/types";

type EditableCustomer = Omit<Partial<CustomerUser>, "deliveryLat" | "deliveryLng"> & {
  password?: string;
  deliveryLat?: number | string;
  deliveryLng?: number | string;
  isActive?: boolean;
};

const emptyCustomer: EditableCustomer = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  deliveryLat: "",
  deliveryLng: "",
  isActive: true,
};

export const AdminCustomers = () => {
  const { t } = useTranslation();
  const { showToast, showError } = useToast();
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [editing, setEditing] = useState<EditableCustomer | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const perpage = 5;

  const loadCustomers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?page=${pageNumber}&perpage=${perpage}`);
      if (Array.isArray(res.data)) {
        setCustomers(res.data || []);
        setTotal(res.data.length);
        setPage(1);
      } else {
        setCustomers(res.data.data || []);
        setTotal(res.data.total || 0);
        setPage(res.data.page || 1);
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(page);
  }, [page]);

  const saveCustomer = async (values: EditableCustomer, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
    setSubmitting(true);
    try {
      if (values.id) {
        await api.patch(`/customers/${values.id}`, values);
        showToast(t("saved"), "success");
      } else {
        await api.post("/customers", values);
        showToast(t("created"), "success");
      }
      setEditing(null);
      await loadCustomers(page);
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCustomer = async (id?: string) => {
    if (!id) return;
    if (!confirm(t("areYouSure"))) return;
    try {
      await api.delete(`/customers/${id}`);
      showToast(t("deleted"), "success");
      await loadCustomers(page);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{t("customers")}</h1>
        <button className="btn" type="button" onClick={() => setEditing(emptyCustomer)}>
          {t("create")}
        </button>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">{customer.name}</div>
              <div className="text-sm text-stone-500">{customer.email}</div>
              <div className="text-sm text-stone-500">{customer.phone}</div>
              <div className="text-sm text-stone-500">{customer.address}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost" type="button" onClick={() => setEditing({ ...customer, password: "" })}>
                <Pencil size={14} /> {t("edit")}
              </button>
              <button className="btn-ghost text-red-600" type="button" onClick={() => deleteCustomer(customer.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="text-sm text-stone-500">Loading…</p>}
      {!loading && !customers.length && <p className="text-stone-500">{t("noCustomers")}</p>}
      <div className="flex items-center gap-2">
        <button className="btn-ghost" type="button" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>
          {t("prev")}
        </button>
        <p className="text-sm text-stone-500">
          {t("page")} {page} / {Math.max(1, Math.ceil(total / perpage))} · {total} {t("items")}
        </p>
        <button className="btn-ghost" type="button" disabled={page * perpage >= total} onClick={() => setPage(page + 1)}>
          {t("next")}
        </button>
      </div>

      {editing && (
        <div className="card">
          <Formik<EditableCustomer> initialValues={editing} enableReinitialize onSubmit={saveCustomer}>
              {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("name")}</span>
                    <Field name="name" className="input-field" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("email")}</span>
                    <Field name="email" type="email" className="input-field" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("phone")}</span>
                    <Field name="phone" className="input-field" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("address")}</span>
                    <Field name="address" className="input-field" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="font-medium">{t("password")}</span>
                    <Field name="password" type="password" className="input-field" />
                    {editing?.id && <p className="text-xs text-stone-500">{t("newPasswordOptional")}</p>}
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1 text-sm">
                      <span className="font-medium">Lat</span>
                      <Field name="deliveryLat" type="number" className="input-field" />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="font-medium">Lng</span>
                      <Field name="deliveryLng" type="number" className="input-field" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Field type="checkbox" name="isActive" checked={!!values.isActive} onChange={(e: ChangeEvent<HTMLInputElement>) => setFieldValue("isActive", e.target.checked)} />
                    {t("active")}
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button className="btn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : t("save")}
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

export default AdminCustomers;

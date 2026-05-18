import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, LogIn, LogOut } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { TableInfo, UserRole } from "@/types";

type Props = {
  role: Extract<UserRole, "chef" | "waiter">;
  onShiftChange?: () => void;
};

export const ShiftPanel = ({ role, onShiftChange }: Props) => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [allTables, setAllTables] = useState<TableInfo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (role !== "waiter") return;
    api.get<TableInfo[]>("/tables", { params: { all: "true" } }).then((r) => setAllTables(r.data));
  }, [role]);

  useEffect(() => {
    if (user?.assignedTableIds) setSelected(user.assignedTableIds);
  }, [user?.assignedTableIds]);

  if (!user) return null;

  const toggleTable = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const startShift = async () => {
    setBusy(true);
    try {
      if (role === "waiter") {
        await api.post("/auth/shift/start", { tableIds: selected });
      } else {
        await api.post("/auth/shift/start");
      }
      await refreshUser();
      onShiftChange?.();
    } finally {
      setBusy(false);
    }
  };

  const endShift = async () => {
    setBusy(true);
    try {
      await api.post("/auth/shift/end");
      await refreshUser();
      setSelected([]);
      onShiftChange?.();
    } finally {
      setBusy(false);
    }
  };

  const saveTables = async () => {
    setBusy(true);
    try {
      await api.patch("/auth/shift/tables", { tableIds: selected });
      await refreshUser();
      onShiftChange?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock className="text-brand-600" size={22} />
          <div>
            <h2 className="font-semibold">{t("shift")}</h2>
            <p className="text-xs text-stone-500">
              {user.onShift ? t("shiftActive") : t("shiftInactive")}
            </p>
          </div>
        </div>
        {user.onShift ? (
          <button type="button" className="btn-outline text-sm" disabled={busy} onClick={endShift}>
            <LogOut size={16} /> {t("endShift")}
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary text-sm"
            disabled={busy || (role === "waiter" && selected.length === 0)}
            onClick={startShift}
          >
            <LogIn size={16} /> {t("startShift")}
          </button>
        )}
      </div>

      {role === "waiter" && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("selectTables")}</p>
          <div className="flex flex-wrap gap-2">
            {allTables.map((tb) => {
              const on = selected.includes(tb._id);
              return (
                <button
                  key={tb._id}
                  type="button"
                  disabled={busy}
                  onClick={() => toggleTable(tb._id)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    on
                      ? "bg-brand-600 text-white"
                      : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {t("table")} {tb.number}
                </button>
              );
            })}
          </div>
          {user.onShift && (
            <button
              type="button"
              className="btn-outline mt-2 w-full text-sm sm:w-auto"
              disabled={busy || selected.length === 0}
              onClick={saveTables}
            >
              {t("updateTables")}
            </button>
          )}
          {!user.onShift && selected.length > 0 && (
            <p className="text-xs text-stone-500">
              {t("tablesSelected", { count: selected.length })}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { joinTable } from "@/lib/socket";
import type { TableInfo } from "@/types";
import { CartProvider } from "@/contexts/CartContext";
import { GuestBottomNav } from "@/components/GuestBottomNav";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import { MessageCircle } from "lucide-react";
import { openWhatsApp } from "@/lib/utils";

export const MenuLayout = () => {
  const { qrCode } = useParams();
  const [table, setTable] = useState<TableInfo | null>(null);
  const { t } = useTranslation();
  const { settings } = useSettings();
  const basePath = `/menu/${qrCode}`;

  useEffect(() => {
    if (!qrCode) return;
    api.get(`/tables/qr/${qrCode}`).then((res) => {
      setTable(res.data);
      sessionStorage.setItem("tableId", res.data._id);
      sessionStorage.setItem("tableNumber", String(res.data.number));
      joinTable(res.data._id);
    });
  }, [qrCode]);

  const whatsapp = () => {
    openWhatsApp(
      settings?.whatsappNumber ?? "201234567890",
      `Hello from table ${table?.number ?? ""}`
    );
  };

  return (
    <CartProvider>
      <section className="min-h-screen pb-20">
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-surface-light/90 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-surface-dark/90">
          <section className="mx-auto flex max-w-lg items-center justify-between gap-2">
            <BrandLogo subtitle={table ? `${t("table")} ${table.number}` : undefined} />
            <section className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={whatsapp} className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50">
                <MessageCircle size={20} />
              </button>
              <LangToggle />
              <ThemeToggle />
            </section>
          </section>
        </header>
        <section className="mx-auto max-w-lg px-4 py-4">
          <Outlet context={{ table, basePath }} />
        </section>
        <GuestBottomNav basePath={basePath} tableId={table?._id} />
      </section>
    </CartProvider>
  );
};

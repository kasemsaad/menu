import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  Table2,
  Users,
  User,
  Ticket,
  BarChart3,
  Star,
  Settings,
  LogOut,
  ChefHat,
  Truck,
  ConciergeBell,
  Tag,
  ImagePlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "dashboard" },
  { to: "/admin/products", icon: Package, label: "products" },
  { to: "/admin/categories", icon: Grid3X3, label: "categories" },
  { to: "/admin/tables", icon: Table2, label: "tables" },
  { to: "/admin/users", icon: Users, label: "users" },
  { to: "/admin/customers", icon: User, label: "customers" },
  { to: "/admin/delivery", icon: Truck, label: "delivery" },
  { to: "/admin/coupons", icon: Ticket, label: "coupons" },
  { to: "/admin/offers", icon: Tag, label: "offers" },
  { to: "/admin/banners", icon: ImagePlus, label: "banners" },
  { to: "/admin/reviews", icon: Star, label: "reviews" },
  { to: "/admin/analytics", icon: BarChart3, label: "analytics" },
  { to: "/admin/settings", icon: Settings, label: "settings" },
];

export const DashboardLayout = ({ role }: { role: "admin" | "chef" | "waiter" | "delivery" }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    role === "admin"
      ? adminLinks
      : role === "chef"
        ? [{ to: "/chef", icon: ChefHat, label: "orders" }]
        : role === "waiter"
          ? [{ to: "/waiter", icon: ConciergeBell, label: "orders" }]
          : [{ to: "/delivery", icon: Truck, label: "delivery" }];

  const base = `/${role}`;

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <aside className="hidden w-64 flex-col border-r border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 md:flex">
        <BrandLogo size="sm" subtitle={user?.role} className="px-1" />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === base}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "nav-link-active"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                }`
              }
            >
              <Icon size={18} />
              {t(label)}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut size={18} />
          {t("logout")}
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
          <h2 className="font-display text-lg font-semibold md:hidden">{t("dashboard")}</h2>
          <div className="ms-auto flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


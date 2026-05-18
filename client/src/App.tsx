import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Login } from "@/pages/Login";
import { MenuLayout } from "@/pages/guest/MenuLayout";
import { DeliveryLayout } from "@/pages/delivery-shop/DeliveryLayout";
import { GuestHome } from "@/pages/guest/GuestHome";
import { GuestMenu } from "@/pages/guest/GuestMenu";
import { ProductDetail } from "@/pages/guest/ProductDetail";
import { GuestCart } from "@/pages/guest/GuestCart";
import { GuestCheckout } from "@/pages/guest/GuestCheckout";
import { DeliveryCheckout } from "@/pages/delivery-shop/DeliveryCheckout";
import { OrderStatus } from "@/pages/guest/OrderStatus";
import { GuestOffers } from "@/pages/guest/GuestOffers";
import { GuestTableOrders } from "@/pages/guest/GuestTableOrders";
import { CustomerSignup } from "@/pages/customer/CustomerSignup";
import { CustomerLogin } from "@/pages/customer/CustomerLogin";
import { ChefDashboard } from "@/pages/chef/ChefDashboard";
import { WaiterDashboard } from "@/pages/waiter/WaiterDashboard";
import { DeliveryDashboard } from "@/pages/delivery/DeliveryDashboard";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminCrud } from "@/pages/admin/AdminCrud";
import { AdminSettings } from "@/pages/admin/AdminSettings";

const App = () => (
  <ThemeProvider>
    <SettingsProvider>
      <AuthProvider>
        <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/customer/signup" element={<CustomerSignup />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/menu/:qrCode" element={<MenuLayout />}>
            <Route index element={<GuestHome />} />
            <Route path="menu" element={<GuestMenu />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<GuestCart />} />
            <Route path="table-orders" element={<GuestTableOrders />} />
            <Route path="checkout" element={<GuestCheckout />} />
            <Route path="order/:orderId" element={<OrderStatus />} />
            <Route path="offers" element={<GuestOffers />} />
          </Route>
          <Route path="/shop" element={<DeliveryLayout />}>
            <Route index element={<GuestHome />} />
            <Route path="menu" element={<GuestMenu />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<GuestCart />} />
            <Route path="checkout" element={<DeliveryCheckout />} />
            <Route path="order/:orderId" element={<OrderStatus />} />
            <Route path="offers" element={<GuestOffers />} />
          </Route>
          <Route
            path="/chef"
            element={
              <ProtectedRoute roles={["chef"]}>
                <DashboardLayout role="chef" />
              </ProtectedRoute>
            }
          >
            <Route index element={<ChefDashboard />} />
          </Route>
          <Route
            path="/waiter"
            element={
              <ProtectedRoute roles={["waiter"]}>
                <DashboardLayout role="waiter" />
              </ProtectedRoute>
            }
          >
            <Route index element={<WaiterDashboard />} />
          </Route>
          <Route
            path="/delivery"
            element={
              <ProtectedRoute roles={["delivery"]}>
                <DashboardLayout role="delivery" />
              </ProtectedRoute>
            }
          >
            <Route index element={<DeliveryDashboard />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminCrud resource="products" />} />
            <Route path="categories" element={<AdminCrud resource="categories" />} />
            <Route path="tables" element={<AdminCrud resource="tables" />} />
            <Route path="users" element={<AdminCrud resource="users" />} />
            <Route path="coupons" element={<AdminCrud resource="coupons" />} />
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="/" element={<Navigate to="/shop" replace />} />
          <Route path="*" element={<Navigate to="/shop" replace />} />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </SettingsProvider>
  </ThemeProvider>
);

export default App;

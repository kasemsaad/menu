import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import type { User, CustomerUser } from "@/types";

const AuthContext = createContext<{
  user: User | null;
  customer: CustomerUser | null;
  login: (email: string, password: string) => Promise<User>;
  customerLogin: (email: string, password: string) => Promise<CustomerUser>;
  customerRegister: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) => Promise<CustomerUser>;
  logout: () => void;
  customerLogout: () => void;
  loading: boolean;
}>({
  user: null,
  customer: null,
  login: async () => ({ id: "", name: "", email: "", role: "admin" }),
  customerLogin: async () => ({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
  }),
  customerRegister: async () => ({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
  }),
  logout: () => {},
  customerLogout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const kind = localStorage.getItem("authKind");
    if (!token) {
      setLoading(false);
      return;
    }
    if (kind === "customer") {
      api
        .get("/auth/customer/me")
        .then((res) => setCustomer(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("authKind");
        })
        .finally(() => setLoading(false));
    } else {
      api
        .get("/auth/me")
        .then((res) =>
          setUser({
            id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
          })
        )
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("authKind");
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("authKind", "staff");
    setCustomer(null);
    setUser(data.user);
    return data.user as User;
  };

  const customerLogin = async (email: string, password: string) => {
    const { data } = await api.post("/auth/customer/login", { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("authKind", "customer");
    setUser(null);
    setCustomer(data.user);
    return data.user as CustomerUser;
  };

  const customerRegister = async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }) => {
    const { data } = await api.post("/auth/customer/register", payload);
    localStorage.setItem("token", data.token);
    localStorage.setItem("authKind", "customer");
    setUser(null);
    setCustomer(data.user);
    return data.user as CustomerUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authKind");
    setUser(null);
  };

  const customerLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authKind");
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        login,
        customerLogin,
        customerRegister,
        logout,
        customerLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

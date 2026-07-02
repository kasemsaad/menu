import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import type { CartItem, Addon, Localized } from "@/types";

interface AddParams {
  productId: string;
  name: Localized;
  price: number;
  quantity: number;
  notes?: string;
  addons: Addon[];
}

const CartContext = createContext<{
  items: CartItem[];
  addItem: (p: AddParams) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  total: number;
  count: number;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((p: AddParams) => {
    const addonTotal = p.addons.reduce((s, a) => s + a.price, 0);
    const subtotal = (p.price + addonTotal) * p.quantity;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === p.productId && i.notes === p.notes);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += p.quantity;
        copy[idx].subtotal = (copy[idx].price + addonTotal) * copy[idx].quantity;
        return copy;
      }
      return [...prev, { ...p, subtotal }];
    });
  }, []);

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const addonTotal = i.addons.reduce((s, a) => s + a.price, 0);
        return { ...i, quantity: qty, subtotal: (i.price + addonTotal) * qty };
      })
    );
  };

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.productId !== productId));

  const total = items.reduce((s, i) => s + i.subtotal, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clear: () => setItems([]), total, count }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};


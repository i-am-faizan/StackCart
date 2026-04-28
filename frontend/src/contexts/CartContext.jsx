import { createContext, useEffect, useMemo, useState } from "react";
import http from "../api/http";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const syncCartState = (data) => {
    setItems(data.cartItems || []);
    setSubtotal(data.subtotal || 0);
  };

  const fetchCart = async () => {
    if (!localStorage.getItem("token")) return;
    setLoading(true);
    try {
      const { data } = await http.get("/cart");
      syncCartState(data);
    } catch (_error) {
      setItems([]);
      setSubtotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await http.post("/cart/items", { productId, quantity });
    syncCartState(data);
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await http.put(`/cart/items/${itemId}`, { quantity });
    syncCartState(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await http.delete(`/cart/items/${itemId}`);
    syncCartState(data);
  };

  const clearCart = async () => {
    const { data } = await http.delete("/cart");
    syncCartState(data);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      subtotal,
      totalItems,
      loading,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCart
    }),
    [items, subtotal, totalItems, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


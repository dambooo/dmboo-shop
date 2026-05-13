'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { defaultProducts } from '@/lib/products';

const ShopContext = createContext();
const normalizeProducts = (list = []) => list.map(product => ({
  ...product,
  hidden: Boolean(product.hidden)
}));
const getVisibleProducts = (list = []) => normalizeProducts(list).filter(product => !product.hidden);

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(getVisibleProducts(defaultProducts));
  const [cart, setCart] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(getVisibleProducts(data));
        }
      })
      .catch(() => {
        setProducts(getVisibleProducts(defaultProducts));
      });
  }, []);

  const refreshProducts = useCallback(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(getVisibleProducts(data));
        }
      })
      .catch(() => {});
  }, []);

  const saveProducts = useCallback((list) => {
    setProducts(getVisibleProducts(list));
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    }).catch(() => {});
  }, []);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  }, []);

  const addToCart = useCallback((productId, qty = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item =>
          item.id === productId ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });

    showToast(`"${product.name}" сагсанд нэмэгдлээ!`);
  }, [products, showToast]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const changeCartQty = useCallback((productId, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;
      if (item.qty + delta <= 0) {
        return prev.filter(i => i.id !== productId);
      }
      return prev.map(i =>
        i.id === productId ? { ...i, qty: i.qty + delta } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      cartTotal,
      cartCount,
      addToCart,
      removeFromCart,
      changeCartQty,
      clearCart,
      refreshProducts,
      saveProducts,
      showToast,
      toastMessage
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}

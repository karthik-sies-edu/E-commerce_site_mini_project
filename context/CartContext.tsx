'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stockQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    imageUrl: string;
    stockQuantity: number;
  }, qty?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shopping_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever cart items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('shopping_cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = (
    product: {
      id: string;
      name: string;
      slug: string;
      price: number | string;
      imageUrl: string;
      stockQuantity: number;
    },
    qty: number = 1
  ): boolean => {
    const numericPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    let addedSuccessfully = true;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stockQuantity) {
          alert(`Sorry, only ${product.stockQuantity} items in stock!`);
          addedSuccessfully = false;
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        if (qty > product.stockQuantity) {
          alert(`Sorry, only ${product.stockQuantity} items in stock!`);
          addedSuccessfully = false;
          return prev;
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: numericPrice,
            imageUrl: product.imageUrl,
            quantity: qty,
            stockQuantity: product.stockQuantity,
          },
        ];
      }
    });

    if (addedSuccessfully) {
      setIsCartOpen(true);
    }
    return addedSuccessfully;
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const clampedQty = Math.min(quantity, item.stockQuantity);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

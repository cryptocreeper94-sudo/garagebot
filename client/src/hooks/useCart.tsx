import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  priceId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: string;
  createdAt: string;
}

interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CartData {
  cart: Cart;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (item: {
    productId: string;
    priceId: string;
    productName: string;
    productImage?: string;
    quantity?: number;
    unitPrice: number;
  }) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cartData, isLoading } = useQuery<CartData>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (item: {
      productId: string;
      priceId: string;
      productName: string;
      productImage?: string;
      quantity?: number;
      unitPrice: number;
    }) => {
      return apiRequest("POST", "/api/cart/items", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/items/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest("DELETE", `/api/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create checkout");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToCart = useCallback(async (item: {
    productId: string;
    priceId: string;
    productName: string;
    productImage?: string;
    quantity?: number;
    unitPrice: number;
  }) => {
    await addMutation.mutateAsync(item);
    setIsOpen(true);
  }, [addMutation]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity });
  }, [updateMutation]);

  const removeItem = useCallback(async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
  }, [removeMutation]);

  const checkout = useCallback(async () => {
    await checkoutMutation.mutateAsync();
  }, [checkoutMutation]);

  const items = cartData?.items || [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart: cartData?.cart || null,
        items,
        isLoading,
        isOpen,
        setIsOpen,
        addToCart,
        updateQuantity,
        removeItem,
        checkout,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

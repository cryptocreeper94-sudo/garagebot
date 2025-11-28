import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, X, CreditCard, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MobileCartButton() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <Button 
      className="w-full gap-2 font-tech uppercase relative"
      onClick={() => setIsOpen(true)}
      data-testid="button-mobile-cart"
    >
      <ShoppingCart className="w-4 h-4" /> 
      Cart
      {totalItems > 0 && (
        <span className="ml-1 bg-black/20 px-2 rounded">({totalItems})</span>
      )}
    </Button>
  );
}

export function CartButton() {
  const { totalItems, isOpen, setIsOpen } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-primary/50 hover:bg-primary/10 hover:text-primary hover:border-primary relative"
          data-testid="button-cart"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="font-tech">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-black text-xs font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-card border-l border-primary/20" data-testid="cart-drawer">
        <CartDrawerContent />
      </SheetContent>
    </Sheet>
  );
}

export function CartDrawerContent() {
  const { items, isLoading, totalAmount, updateQuantity, removeItem, checkout, setIsOpen } = useCart();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <SheetTitle className="font-tech text-xl uppercase flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Cart
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" data-testid="button-close-cart">
              <X className="w-5 h-5" />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">Your cart is empty</p>
          <p className="text-sm text-muted-foreground/60">Add items from the featured deals or search for parts</p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 py-4">
            <div className="space-y-4 pr-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-3 p-3 rounded-lg bg-black/20 border border-white/5"
                  data-testid={`cart-item-${item.id}`}
                >
                  {item.productImage ? (
                    <img 
                      src={item.productImage} 
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-black/40"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary/50" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" data-testid={`text-item-name-${item.id}`}>
                      {item.productName}
                    </p>
                    <p className="text-primary font-tech text-lg" data-testid={`text-item-price-${item.id}`}>
                      ${parseFloat(item.unitPrice).toFixed(2)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-7 h-7 border-white/10"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-mono text-sm" data-testid={`text-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-7 h-7 border-white/10"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-7 h-7 ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => removeItem(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-tech text-xl text-primary" data-testid="text-cart-total">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            
            <Button 
              className="w-full h-12 bg-primary text-black hover:bg-primary/90 font-tech uppercase text-lg gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              onClick={checkout}
              data-testid="button-checkout"
            >
              <CreditCard className="w-5 h-5" />
              Checkout
            </Button>
            
            <p className="text-[10px] text-muted-foreground/60 text-center font-mono">
              Secure checkout powered by Stripe
            </p>
          </div>
        </>
      )}
    </div>
  );
}

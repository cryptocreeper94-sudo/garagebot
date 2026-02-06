import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ShieldCheck, CreditCard, Wallet, CheckCircle, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

let stripePromiseCache: ReturnType<typeof loadStripe> | null = null;

function getStripePromise() {
  if (!stripePromiseCache) {
    stripePromiseCache = fetch('/api/stripe/config')
      .then(r => r.json())
      .then(data => loadStripe(data.publishableKey));
  }
  return stripePromiseCache;
}

interface CheckoutFormProps {
  total: number;
  onSuccess: () => void;
}

const CheckoutForm = ({ total, onSuccess }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const { checkout } = useCart();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      await checkout();
      setPaymentStatus("success");
      onSuccess();
    } catch (err: any) {
      setPaymentStatus("error");
      setErrorMessage(err.message || 'Payment failed');
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="text-center py-10 space-y-4">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500"
        >
          <CheckCircle className="w-10 h-10" />
        </motion.div>
        <h3 className="text-2xl font-tech font-bold uppercase text-white" data-testid="text-order-confirmed">Order Confirmed</h3>
        <p className="text-muted-foreground font-mono text-sm">Thank you for your purchase!</p>
        <Link href="/">
          <Button className="font-tech uppercase" data-testid="button-return-home">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase text-muted-foreground">Card Details</label>
        <div className="p-4 bg-background/50 border border-white/10 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  fontFamily: 'JetBrains Mono, monospace',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-left flex gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full h-12 font-tech uppercase tracking-wider bg-primary text-black hover:bg-primary/90"
        data-testid="button-pay"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
        ) : (
          `Pay $${total.toFixed(2)}`
        )}
      </Button>
      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground">
        <ShieldCheck className="w-3 h-3" /> Secured by Stripe
      </div>
    </form>
  );
};

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const { items, totalAmount } = useCart();
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    getStripePromise().then(sp => {
      setStripeInstance(sp);
      setStripeReady(true);
    });
  }, []);

  const tax = totalAmount * 0.08;
  const total = totalAmount + tax;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="pt-24 pb-12 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-tech font-bold uppercase text-primary mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to complete your purchase.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Nav />
        <div className="pt-24 pb-12 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-tech font-bold uppercase text-primary mb-4">Cart is Empty</h2>
          <p className="text-muted-foreground mb-6">Add some parts to your cart before checking out.</p>
          <Link href="/">
            <Button className="font-tech uppercase" data-testid="button-browse-parts">
              <ArrowLeft className="w-4 h-4 mr-2" /> Browse Parts
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <h2 className="font-tech font-bold text-2xl uppercase text-primary" data-testid="text-order-summary">Order Summary</h2>
            <Card className="glass-card card-3d border-border p-6 space-y-4">
              {items.map((item, i) => (
                <div key={item.id} className="flex gap-4" data-testid={`cart-item-${i}`}>
                  {item.productImage && (
                    <div className="w-16 h-16 bg-black/20 rounded overflow-hidden flex-shrink-0">
                      <img src={item.productImage} className="w-full h-full object-cover" alt={item.productName} />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold font-tech uppercase text-sm">{item.productName}</h3>
                    <p className="text-xs font-mono text-muted-foreground">Qty: {item.quantity}</p>
                    <div className="mt-1 text-primary font-bold font-mono">${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-white/5 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Tax (est.)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold font-tech text-white pt-2 border-t border-white/5 mt-2">
                  <span>Total</span>
                  <span data-testid="text-total">${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="font-tech font-bold text-2xl uppercase text-primary">Payment Method</h2>
            <Card className="glass-ultra border-border p-1">
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-black/20 h-12 p-1">
                  <TabsTrigger value="card" className="font-mono text-xs uppercase flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black" data-testid="tab-card">
                    <CreditCard className="w-4 h-4" /> Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="font-mono text-xs uppercase flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black" data-testid="tab-crypto">
                    <Wallet className="w-4 h-4" /> Crypto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="p-6">
                  {stripeReady && stripeInstance ? (
                    <Elements stripe={stripeInstance}>
                      <CheckoutForm total={total} onSuccess={() => setOrderComplete(true)} />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="crypto" className="p-6 text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold font-tech uppercase text-lg">Pay with Crypto</h3>
                  <p className="text-sm text-muted-foreground">Crypto payments coming soon. Use a credit card for now.</p>
                  
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-left flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-500/80 font-mono leading-tight">
                      Crypto payment integration is in development. Check back soon!
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Wallet, CheckCircle, AlertTriangle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Nav from "@/components/Nav";

// Mock Stripe Promise (Replace with process.env.STRIPE_PUBLIC_KEY when integrated)
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus("success");
    }, 2000);
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
        <h3 className="text-2xl font-tech font-bold uppercase text-white">Order Confirmed</h3>
        <p className="text-muted-foreground font-mono text-sm">Transaction ID: #TX-98293842</p>
        <Button className="font-tech uppercase" onClick={() => window.location.href = "/"}>Return Home</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="card-element" className="font-mono text-xs uppercase text-muted-foreground">Card Details</Label>
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
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full h-12 font-tech uppercase tracking-wider bg-primary text-black hover:bg-primary/90"
      >
        {isProcessing ? "Processing..." : "Pay $45.50"}
      </Button>
      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground">
        <ShieldCheck className="w-3 h-3" /> Secured by Stripe
      </div>
    </form>
  );
};

export default function Checkout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <div className="pt-24 pb-12 container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="font-tech font-bold text-2xl uppercase text-primary">Order Summary</h2>
            <Card className="bg-card/50 border-border p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-black/20 rounded overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1600685039239-c72963c4a8a5?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold font-tech uppercase">Brembo Ceramic Brake Pads</h3>
                  <p className="text-xs font-mono text-muted-foreground">Part #: P83024N</p>
                  <div className="mt-2 text-primary font-bold font-mono">$45.50</div>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-4 space-y-2">
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Subtotal</span>
                  <span>$45.50</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Shipping (2-Day)</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-mono text-muted-foreground">
                  <span>Tax</span>
                  <span>$3.64</span>
                </div>
                <div className="flex justify-between text-lg font-bold font-tech text-white pt-2 border-t border-white/5 mt-2">
                  <span>Total</span>
                  <span>$49.14</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Method */}
          <div className="space-y-6">
            <h2 className="font-tech font-bold text-2xl uppercase text-primary">Payment Method</h2>
            <Card className="bg-card border-border p-1">
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-black/20 h-12 p-1">
                  <TabsTrigger value="card" className="font-mono text-xs uppercase flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black">
                    <CreditCard className="w-4 h-4" /> Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="font-mono text-xs uppercase flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black">
                    <Wallet className="w-4 h-4" /> Crypto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="p-6">
                  <Elements stripe={stripePromise}>
                    <CheckoutForm />
                  </Elements>
                </TabsContent>

                <TabsContent value="crypto" className="p-6 text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4">
                    <img src="https://cryptologos.cc/logos/coinbase-coin-coin-logo.svg?v=026" className="w-8 h-8 opacity-80 invert" alt="Coinbase" />
                  </div>
                  <h3 className="font-bold font-tech uppercase text-lg">Pay with Coinbase</h3>
                  <p className="text-sm text-muted-foreground">Use Bitcoin, Ethereum, USDC, or other cryptocurrencies to complete your purchase.</p>
                  
                  <Button className="w-full h-12 bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-tech uppercase tracking-wider">
                    Connect Coinbase Wallet
                  </Button>
                  
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-left flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-yellow-500/80 font-mono leading-tight">
                      Crypto payments are non-refundable directly. Store credit will be issued for returns.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

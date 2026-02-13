import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Package, Home } from "lucide-react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      
      <div className="pt-24 container mx-auto px-4 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center glass-panel border-primary/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>
            
            <h1 className="text-3xl font-tech font-bold uppercase mb-2" data-testid="text-success-title">
              Order Confirmed!
            </h1>
            
            <p className="text-muted-foreground mb-6" data-testid="text-success-message">
              Thank you for your purchase. Your order is being processed and you'll receive a confirmation email shortly.
            </p>
            
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full gap-2 bg-primary text-black hover:bg-primary/90 font-tech uppercase" data-testid="button-track-order">
                  <Package className="w-4 h-4" />
                  Track Your Order
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full gap-2 border-white/10 font-tech uppercase" data-testid="button-continue-shopping">
                  <Home className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
            
            <p className="text-xs text-muted-foreground/60 font-mono mt-6">
              Order confirmation #AL-{Date.now().toString(36).toUpperCase()}
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

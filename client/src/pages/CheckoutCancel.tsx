import { Link } from "wouter";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, ShoppingCart, MessageCircle } from "lucide-react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      
      <div className="pt-24 container mx-auto px-4 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center glass-panel border-red-500/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-red-500" />
            </motion.div>
            
            <h1 className="text-3xl font-tech font-bold uppercase mb-2" data-testid="text-cancel-title">
              Checkout Cancelled
            </h1>
            
            <p className="text-muted-foreground mb-6" data-testid="text-cancel-message">
              Your order was not completed. Don't worry - your cart items are still saved and ready when you are.
            </p>
            
            <div className="space-y-3">
              <Link href="/">
                <Button className="w-full gap-2 bg-primary text-black hover:bg-primary/90 font-tech uppercase" data-testid="button-return-home">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Shopping
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full gap-2 border-white/10 font-tech uppercase" data-testid="button-contact-support">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground/60 font-mono mt-6">
              Need help? We're here 24/7
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/useCart";
import OnboardingModal from "@/components/OnboardingModal";
import AIMascot from "@/components/AIMascot";
import BuddyHideSeek from "@/components/BuddyHideSeek";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Results from "@/pages/Results";
import Garage from "@/pages/Garage";
import Dashboard from "@/pages/Dashboard";
import AccountSetup from "@/pages/AccountSetup";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import ShopPortal from "@/pages/ShopPortal";
import Insurance from "@/pages/Insurance";
import Auth from "@/pages/Auth";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Investors from "@/pages/Investors";
import DevPortal from "@/pages/DevPortal";
import Pro from "@/pages/Pro";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/results" component={Results} />
      <Route path="/garage" component={Garage} />
      <Route path="/shop-portal" component={ShopPortal} />
      <Route path="/insurance" component={Insurance} />
      <Route path="/auth" component={Auth} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/investors" component={Investors} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/account" component={AccountSetup} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/dev" component={DevPortal} />
      <Route path="/pro" component={Pro} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <OnboardingModal />
          <Router />
          <AIMascot mascotName="Buddy" />
          <BuddyHideSeek />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;

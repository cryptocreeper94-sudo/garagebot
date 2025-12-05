import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/useCart";
import OnboardingModal from "@/components/OnboardingModal";
import AIMascot from "@/components/AIMascot";
import BuddyHideSeek from "@/components/BuddyHideSeek";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import { BlockchainAnnouncement } from "@/components/FeatureAnnouncement";
import gbEmblem from "@assets/generated_images/gb_emblem_no_bg.png";
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
import MechanicsGarage from "@/pages/MechanicsGarage";
import Insurance from "@/pages/Insurance";
import Auth from "@/pages/Auth";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Investors from "@/pages/Investors";
import DevPortal from "@/pages/DevPortal";
import Pro from "@/pages/Pro";
import GenesisHallmark from "@/pages/GenesisHallmark";
import DIYGuides from "@/pages/DIYGuides";
import TermsOfService from "@/pages/TermsOfService";
import InviteFriends from "@/pages/InviteFriends";
import VendorSignup from "@/pages/VendorSignup";

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <Home />}</Route>
      <Route path="/results">{() => <Results />}</Route>
      <Route path="/garage">{() => <Garage />}</Route>
      <Route path="/shop-portal">{() => <ShopPortal />}</Route>
      <Route path="/mechanics-garage">{() => <MechanicsGarage />}</Route>
      <Route path="/insurance">{() => <Insurance />}</Route>
      <Route path="/auth">{() => <Auth />}</Route>
      <Route path="/privacy">{() => <PrivacyPolicy />}</Route>
      <Route path="/terms">{() => <TermsOfService />}</Route>
      <Route path="/investors">{() => <Investors />}</Route>
      <Route path="/dashboard">{() => <Dashboard />}</Route>
      <Route path="/account">{() => <AccountSetup />}</Route>
      <Route path="/checkout">{() => <Checkout />}</Route>
      <Route path="/checkout/success">{() => <CheckoutSuccess />}</Route>
      <Route path="/checkout/cancel">{() => <CheckoutCancel />}</Route>
      <Route path="/dev">{() => <DevPortal />}</Route>
      <Route path="/pro">{() => <Pro />}</Route>
      <Route path="/hallmark">{() => <GenesisHallmark />}</Route>
      <Route path="/diy-guides">{() => <DIYGuides />}</Route>
      <Route path="/invite">{() => <InviteFriends />}</Route>
      <Route path="/vendor-signup">{() => <VendorSignup />}</Route>
      <Route>{() => <NotFound />}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <div 
            className="fixed inset-0 z-[-2] pointer-events-none flex items-center justify-center"
            aria-hidden="true"
          >
            <img 
              src={gbEmblem} 
              alt="" 
              className="w-[60vmin] h-[60vmin] max-w-[500px] max-h-[500px] opacity-[0.04] select-none"
              style={{ filter: 'grayscale(30%)' }}
            />
          </div>
          <Toaster />
          <OnboardingModal />
          <AddToHomeScreen />
          <BlockchainAnnouncement />
          <Router />
          <AIMascot mascotName="Buddy" />
          <BuddyHideSeek />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;

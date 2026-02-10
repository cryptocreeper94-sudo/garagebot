import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/useCart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import WelcomeGate from "@/components/WelcomeGate";
import AIMascot from "@/components/AIMascot";

import RatingPrompt from "@/components/RatingPrompt";
import BuddyHideSeek from "@/components/BuddyHideSeek";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import CookieConsent from "@/components/CookieConsent";

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
import AuthCallback from "@/pages/AuthCallback";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Investors from "@/pages/Investors";
import DevPortal from "@/pages/DevPortal";
import Pro from "@/pages/Pro";
import GenesisHallmark from "@/pages/GenesisHallmark";
import DIYGuides from "@/pages/DIYGuides";
import TermsOfService from "@/pages/TermsOfService";
import InviteFriends from "@/pages/InviteFriends";
import VendorSignup from "@/pages/VendorSignup";
import Wishlists from "@/pages/Wishlists";
import SharedWishlist from "@/pages/SharedWishlist";
import Projects from "@/pages/Projects";
import Blog from "@/pages/Blog";
import MarketingHub from "@/pages/MarketingHub";
import MechanicsGarageSales from "@/pages/MechanicsGarageSales";
import ShadeTreeMechanics from "@/pages/ShadeTreeMechanics";
import TriviaQuiz from "@/pages/TriviaQuiz";
import BreakRoom from "@/pages/BreakRoom";
import CDLDirectory from "@/pages/CDLDirectory";
import Support from "@/pages/Support";
import SignalChat from "@/pages/SignalChat";
import AffiliateDisclosure from "@/pages/AffiliateDisclosure";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PartsMarketplace from "@/pages/PartsMarketplace";
import Explore from "@/pages/Explore";
import Rentals from "@/pages/Rentals";

function AnalyticsTracker() {
  useAnalytics();
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <Home />}</Route>
      <Route path="/results">{() => <Results />}</Route>
      <Route path="/garage">{() => <Garage />}</Route>
      <Route path="/wishlists">{() => <Wishlists />}</Route>
      <Route path="/wishlist/:shareCode">{() => <SharedWishlist />}</Route>
      <Route path="/projects">{() => <Projects />}</Route>
      <Route path="/shop-portal">{() => <ShopPortal />}</Route>
      <Route path="/mechanics-garage">{() => <MechanicsGarage />}</Route>
      <Route path="/mechanics-garage/info">{() => <MechanicsGarageSales />}</Route>
      <Route path="/shade-tree">{() => <ShadeTreeMechanics />}</Route>
      <Route path="/insurance">{() => <Insurance />}</Route>
      <Route path="/auth">{() => <Auth />}</Route>
      <Route path="/auth/callback">{() => <AuthCallback />}</Route>
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
      <Route path="/blog">{() => <Blog />}</Route>
      <Route path="/blog/:slug">{() => <Blog />}</Route>
      <Route path="/marketing">{() => <MarketingHub />}</Route>
      <Route path="/trivia">{() => <TriviaQuiz />}</Route>
      <Route path="/break-room">{() => <BreakRoom />}</Route>
      <Route path="/cdl-directory">{() => <CDLDirectory />}</Route>
      <Route path="/support">{() => <Support />}</Route>
      <Route path="/chat">{() => <SignalChat />}</Route>
      <Route path="/affiliate-disclosure">{() => <AffiliateDisclosure />}</Route>
      <Route path="/about">{() => <About />}</Route>
      <Route path="/contact">{() => <Contact />}</Route>
      <Route path="/marketplace">{() => <PartsMarketplace />}</Route>
      <Route path="/explore">{() => <Explore />}</Route>
      <Route path="/rentals">{() => <Rentals />}</Route>
      <Route>{() => <NotFound />}</Route>
    </Switch>
  );
}

function AuthAwareExtras() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <AddToHomeScreen />
      <BuddyHideSeek />
    </>
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
          <WelcomeGate />
          <AnalyticsTracker />
          <Router />
          <AIMascot mascotName="Buddy" />
          <RatingPrompt />

          <CookieConsent />
          <AuthAwareExtras />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;

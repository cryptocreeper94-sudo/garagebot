import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProSubscription from "@/components/ProSubscription";
import bgImage from "@assets/generated_images/al_watermark_background_texture.png";

export default function Pro() {
  return (
    <div className="min-h-screen text-foreground font-sans relative">
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      <Nav />
      
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
        <ProSubscription />
      </div>
      
      <Footer />
    </div>
  );
}

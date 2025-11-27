import Nav from "@/components/Nav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, Trash2, Settings } from "lucide-react";

export default function Garage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <div className="container mx-auto px-4 pt-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-tech font-bold uppercase text-primary">My Garage</h1>
            <p className="text-muted-foreground mt-2 font-mono">MANAGE YOUR FLEET FOR QUICK SEARCHES</p>
          </div>
          <Button className="gap-2 font-tech uppercase">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Saved Vehicle 1 */}
          <Card className="bg-card border-primary/50 overflow-hidden group relative">
            <div className="h-32 bg-gradient-to-r from-black to-gray-900 flex items-center justify-center relative">
              <Car className="w-16 h-16 text-primary/20 group-hover:text-primary/40 transition-colors" />
              <div className="absolute bottom-3 left-4 font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                PRIMARY VEHICLE
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-tech font-bold uppercase">2022 Toyota Tacoma</h3>
              <p className="text-muted-foreground text-sm font-mono mb-4">TRD OFF-ROAD 4WD 3.5L V6</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                  <span className="text-muted-foreground">VIN</span>
                  <span className="font-mono">***8392</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                  <span className="text-muted-foreground">Oil Type</span>
                  <span className="font-mono text-white">0W-20 Synthetic</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                  <span className="text-muted-foreground">Tire Size</span>
                  <span className="font-mono text-white">265/70R16</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 font-tech uppercase" variant="default">Shop Parts</Button>
                <Button size="icon" variant="outline"><Settings className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>

          {/* Saved Vehicle 2 */}
          <Card className="bg-card border-border overflow-hidden group opacity-75 hover:opacity-100 transition-opacity">
            <div className="h-32 bg-gradient-to-r from-black to-gray-900 flex items-center justify-center">
               <Car className="w-16 h-16 text-muted-foreground/20 group-hover:text-white/20 transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-tech font-bold uppercase">1967 Ford Mustang</h3>
              <p className="text-muted-foreground text-sm font-mono mb-4">FASTBACK 289 V8</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                  <span className="text-muted-foreground">VIN</span>
                  <span className="font-mono">***1029</span>
                </div>
                <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                  <span className="text-muted-foreground">Oil Type</span>
                  <span className="font-mono text-white">10W-30 Conventional</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 font-tech uppercase" variant="secondary">Shop Parts</Button>
                <Button size="icon" variant="outline"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

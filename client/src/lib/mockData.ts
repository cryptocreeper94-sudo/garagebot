import { Car, Battery, Disc, Zap, Cog, Wrench, Fuel, Thermometer, Bike, Ship, Truck, Mountain, Waves, Gauge } from "lucide-react";

export const VEHICLE_TYPES = [
  { id: "cars", name: "Cars & Trucks", icon: Car, description: "Sedans, SUVs, Trucks, Vans" },
  { id: "motorcycles", name: "Motorcycles", icon: Bike, description: "Street, Sport, Cruiser, Touring" },
  { id: "atvs", name: "ATVs & UTVs", icon: Mountain, description: "Quads, Side-by-Sides, Can-Am" },
  { id: "boats", name: "Boats & Marine", icon: Ship, description: "Outboard, Inboard, PWC, Pontoon" },
  { id: "powersports", name: "Powersports", icon: Gauge, description: "Dirt Bikes, Snowmobiles, Go-Karts" },
  { id: "rv", name: "RV & Trailer", icon: Truck, description: "Motorhomes, Campers, Utility" },
];

export const CATEGORIES = [
  { id: "brakes", name: "Brakes", icon: Disc },
  { id: "engine", name: "Engine", icon: Cog },
  { id: "suspension", name: "Suspension", icon: Car },
  { id: "electrical", name: "Electrical", icon: Zap },
  { id: "exhaust", name: "Exhaust", icon: Fuel },
  { id: "cooling", name: "Cooling", icon: Thermometer },
  { id: "filters", name: "Filters", icon: Wrench },
  { id: "batteries", name: "Batteries", icon: Battery },
  { id: "powersports", name: "Powersports", icon: Bike },
  { id: "marine", name: "Marine", icon: Waves },
];

export const MOCK_RESULTS = [
  {
    id: 1,
    name: "Brembo Ceramic Brake Pads (Front)",
    partNumber: "P83024N",
    fitment: "2018-2024 Toyota Tacoma",
    image: "https://images.unsplash.com/photo-1600685039239-c72963c4a8a5?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "AutoZone", price: 59.99, shipping: "Free Pickup", inStock: true, location: "0.8 mi • Main St" },
      { store: "Amazon", price: 45.50, shipping: "2-Day Free", inStock: true, location: "Online Only" },
      { store: "RockAuto", price: 38.99, shipping: "+$12.00 Ship", inStock: true, location: "Online Only" },
    ],
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: 2,
    name: "TaoTao 110cc Carburetor PZ19",
    partNumber: "PZ19-CARB",
    fitment: "Universal Chinese ATV / Go-Kart",
    image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "VMC Chinese Parts", price: 18.95, shipping: "+$5.00 Ship", inStock: true, location: "Online Only" },
      { store: "Amazon", price: 14.99, shipping: "Prime", inStock: true, location: "Online Only" },
      { store: "eBay Motors", price: 12.50, shipping: "Free Ship (Slow)", inStock: true, location: "Online Only" },
    ],
    rating: 4.2,
    reviews: 315,
  },
  {
    id: 3,
    name: "Bosch Icon Wiper Blade 26\"",
    partNumber: "26A",
    fitment: "Universal Hook Arm",
    image: "https://images.unsplash.com/photo-1619646972479-6d4e46936635?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "O'Reilly", price: 28.99, shipping: "Free Pickup", inStock: true, location: "1.2 mi • Broadway" },
      { store: "Amazon", price: 24.50, shipping: "Prime", inStock: true, location: "Online Only" },
    ],
    rating: 4.7,
    reviews: 3200,
  },
  {
    id: 4,
    name: "Castrol GTX High Mileage 5W-30 (5qt)",
    partNumber: "1597B1",
    fitment: "Universal",
    image: "https://images.unsplash.com/photo-1563286092-5c4723403b92?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "Walmart", price: 26.44, shipping: "Free Pickup", inStock: true, location: "2.5 mi • Supercenter" },
      { store: "AutoZone", price: 32.99, shipping: "Free Pickup", inStock: true, location: "0.8 mi • Main St" },
    ],
    rating: 4.8,
    reviews: 560,
  },
  {
    id: 5,
    name: "Mercury Outboard Gear Lube",
    partNumber: "92-858064K01",
    fitment: "Mercury / Mariner Outboards",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "West Marine", price: 24.99, shipping: "Free Pickup", inStock: true, location: "5.2 mi • Marina Dr" },
      { store: "Amazon", price: 19.95, shipping: "Prime", inStock: true, location: "Online Only" },
    ],
    rating: 4.9,
    reviews: 890,
  },
  {
    id: 6,
    name: "Can-Am Maverick X3 Belt",
    partNumber: "422280652",
    fitment: "2017-2024 Can-Am Maverick X3",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "Dennis Kirk", price: 189.99, shipping: "Free Ship", inStock: true, location: "Online Only" },
      { store: "Rocky Mountain ATV", price: 179.95, shipping: "+$8.00 Ship", inStock: true, location: "Online Only" },
    ],
    rating: 4.6,
    reviews: 425,
  },
];

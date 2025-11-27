import { Car, Battery, Disc, Zap, Cog, Wrench, Fuel, Thermometer, Bike } from "lucide-react";

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
    image: "https://images.unsplash.com/photo-1619646972479-6d4e46936235?auto=format&fit=crop&q=80&w=400",
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
];

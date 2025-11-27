import { Car, Battery, Disc, Zap, Cog, Wrench, Fuel, Thermometer } from "lucide-react";

export const CATEGORIES = [
  { id: "brakes", name: "Brakes", icon: Disc },
  { id: "engine", name: "Engine", icon: Cog },
  { id: "suspension", name: "Suspension", icon: Car },
  { id: "electrical", name: "Electrical", icon: Zap },
  { id: "exhaust", name: "Exhaust", icon: Fuel },
  { id: "cooling", name: "Cooling", icon: Thermometer },
  { id: "filters", name: "Filters", icon: Wrench },
  { id: "batteries", name: "Batteries", icon: Battery },
];

export const MOCK_RESULTS = [
  {
    id: 1,
    name: "Brembo Ceramic Brake Pads (Front)",
    partNumber: "P83024N",
    fitment: "2018-2024 Toyota Tacoma",
    image: "https://images.unsplash.com/photo-1600685039239-c72963c4a8a5?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "AutoZone", price: 59.99, shipping: "Free Pickup", inStock: true },
      { store: "Amazon", price: 45.50, shipping: "2-Day Free", inStock: true },
      { store: "RockAuto", price: 38.99, shipping: "+$12.00 Ship", inStock: true },
    ],
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: 2,
    name: "K&N High Performance Air Filter",
    partNumber: "33-2031",
    fitment: "Universal / Multiple Fits",
    image: "https://images.unsplash.com/photo-1556806875-72c031588787?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "Advance Auto", price: 64.99, shipping: "Same Day", inStock: true },
      { store: "Summit Racing", price: 59.95, shipping: "Free Ship > $100", inStock: true },
      { store: "Walmart", price: 52.00, shipping: "3-Day", inStock: false },
    ],
    rating: 4.9,
    reviews: 850,
  },
  {
    id: 3,
    name: "Bosch Icon Wiper Blade 26\"",
    partNumber: "26A",
    fitment: "Universal Hook Arm",
    image: "https://images.unsplash.com/photo-1619646972479-6d4e46936235?auto=format&fit=crop&q=80&w=400",
    prices: [
      { store: "O'Reilly", price: 28.99, shipping: "Free Pickup", inStock: true },
      { store: "Amazon", price: 24.50, shipping: "Prime", inStock: true },
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
      { store: "Walmart", price: 26.44, shipping: "Free Pickup", inStock: true },
      { store: "AutoZone", price: 32.99, shipping: "Free Pickup", inStock: true },
    ],
    rating: 4.8,
    reviews: 560,
  },
];

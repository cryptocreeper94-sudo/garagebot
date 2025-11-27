import { db } from "../db/index.js";
import { deals } from "../shared/schema.js";

const dealData = [
  {
    title: "Mobil 1 Advanced Full Synthetic",
    description: "5W-30 Motor Oil, 5 Quart",
    price: "29.99",
    originalPrice: "39.99",
    discount: "25% OFF",
    vendor: "AutoZone",
    imageUrl: "https://images.unsplash.com/photo-1635784063748-252802c6c25c?q=80&w=600&auto=format&fit=crop",
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "Duralast Gold Brake Pads",
    description: "Ceramic Front Brake Pads",
    price: "54.99",
    originalPrice: "64.99",
    discount: "15% OFF",
    vendor: "O'Reilly",
    imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=600&auto=format&fit=crop",
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "DieHard Platinum AGM Battery",
    description: "Group Size H6, 760 CCA",
    price: "219.99",
    originalPrice: "249.99",
    discount: "$30 OFF",
    vendor: "Advance Auto",
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop",
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    isActive: true
  },
  {
    title: "K&N High Performance Air Filter",
    description: "Washable and Reusable",
    price: "49.99",
    originalPrice: "59.99",
    discount: "$10 OFF",
    vendor: "AutoZone",
    imageUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=600&auto=format&fit=crop",
    expiresAt: new Date(Date.now() + 28 * 60 * 60 * 1000),
    isActive: true
  }
];

await db.insert(deals).values(dealData);
console.log("✅ Seeded deals successfully!");
process.exit(0);

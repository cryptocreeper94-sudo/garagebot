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
    imageUrl: "/generated_images/product_motor_oil.png",
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
    imageUrl: "/generated_images/product_brake_pads.png",
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
    imageUrl: "/generated_images/car_battery.png",
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
    imageUrl: "/generated_images/product_air_filter.png",
    expiresAt: new Date(Date.now() + 28 * 60 * 60 * 1000),
    isActive: true
  }
];

await db.insert(deals).values(dealData);
console.log("✅ Seeded deals successfully!");
process.exit(0);

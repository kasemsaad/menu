import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Category } from "./models/Category.js";
import { Product } from "./models/Product.js";
import { Table } from "./models/Table.js";
import { Settings } from "./models/Settings.js";
import { Coupon } from "./models/Coupon.js";
import { Offer } from "./models/Offer.js";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  await connectDB();

  await User.deleteMany({});
  const password = await bcrypt.hash("admin123", 10);
  await User.insertMany([
    { name: "Admin", email: "admin@cafe.com", password, role: "admin" },
    { name: "Chef", email: "chef@cafe.com", password, role: "chef" },
    { name: "Waiter", email: "waiter@cafe.com", password, role: "waiter" },
    { name: "Driver", email: "delivery@cafe.com", password, role: "delivery" },
  ]);

  await Category.deleteMany({});
  const cats = await Category.insertMany([
    { name: { en: "Hot Drinks", ar: "مشروبات ساخنة" }, sortOrder: 1 },
    { name: { en: "Cold Drinks", ar: "مشروبات باردة" }, sortOrder: 2 },
    { name: { en: "Desserts", ar: "حلويات" }, sortOrder: 3 },
    { name: { en: "Breakfast", ar: "فطور" }, sortOrder: 4 },
  ]);

  await Product.deleteMany({});
  await Product.insertMany([
    {
      categoryId: cats[0]._id,
      name: { en: "Cappuccino", ar: "كابتشينو" },
      description: { en: "Rich espresso with steamed milk", ar: "إسبريسو مع حليب مبخر" },
      price: 45,
      isFeatured: true,
      addons: [
        { name: { en: "Extra shot", ar: "شوت إضافي" }, price: 10 },
        { name: { en: "Oat milk", ar: "حليب شوفان" }, price: 8 },
      ],
    },
    {
      categoryId: cats[0]._id,
      name: { en: "Latte", ar: "لاتيه" },
      price: 42,
      addons: [{ name: { en: "Vanilla", ar: "فانيليا" }, price: 5 }],
    },
    {
      categoryId: cats[1]._id,
      name: { en: "Iced Mocha", ar: "موكا مثلجة" },
      price: 55,
      isFeatured: true,
    },
    {
      categoryId: cats[2]._id,
      name: { en: "Cheesecake", ar: "تشيز كيك" },
      price: 65,
      isFeatured: true,
    },
    {
      categoryId: cats[3]._id,
      name: { en: "Croissant", ar: "كرواسون" },
      price: 35,
    },
  ]);

  await Table.deleteMany({});
  for (let i = 1; i <= 6; i++) {
    await Table.create({ number: i, qrCode: uuidv4(), capacity: 4 });
  }

  await Settings.deleteMany({});
  await Settings.create({
    taxPercent: 14,
    deliveryFee: 25,
    whatsappNumber: process.env.WHATSAPP_NUMBER || "201234567890",
    restaurantName: { en: "Brew & Bite Cafe", ar: "مقهى برو آند بايت" },
  });

  await Coupon.deleteMany({});
  await Coupon.create({
    code: "WELCOME10",
    discountType: "percent",
    value: 10,
    minOrder: 50,
    maxUses: 100,
  });

  await Offer.deleteMany({});
  const products = await Product.find().limit(2);
  await Offer.create({
    title: { en: "Weekend Special", ar: "عرض نهاية الأسبوع" },
    description: { en: "15% off selected items", ar: "خصم 15% على منتجات مختارة" },
    discountPercent: 15,
    productIds: products.map((p) => p._id),
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  console.log("Seed complete. Login: admin@cafe.com / admin123");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

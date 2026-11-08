import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["bug-awareness", "Bug Awareness", "בדיקת תולעים", "Which foods are prone to infestation, how to check them, and what to look for."],
  ["home-checking", "Home Checking System", "מערכת בדיקה בבית", "A simple, reliable system for checking produce and keeping your own kitchen to a high standard."],
  ["bakeries", "Common Issues in Bakeries", "מאפיות", "Ingredients, equipment, pas Yisroel, chalav Yisroel and what to watch for in bakeries."],
  ["dairy-restaurants", "Common Issues in Dairy Restaurants", "מסעדות חלביות", "Cheese, produce, fish and kitchen practices in dairy restaurants."],
  ["meat-restaurants", "Common Issues in Meat Restaurants", "מסעדות בשריות", "Meat supervision, kashering, liver, bishul Yisroel and more."],
  ["supermarket", "Common Issues at the Supermarket", "סופרמרקט", "Reading labels, symbols, deli and bakery counters, and produce."],
  ["catering-kitchens", "Common Issues at Catering Kitchens", "מטבחי קייטרינג", "Volume production, staff, deliveries and supervision in catering kitchens."],
  ["off-site-events", "Common Issues at Off Site Events", "אירועים מחוץ למקום", "Halls, hotels, outdoor events, transport and sealing of food."],
];

async function main() {
  for (const [i, [slug, title, hebrew, description]] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, title, hebrew, description, order: i + 1 },
    });
  }

  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: process.env.ADMIN_NAME || "Admin",
          password: await bcrypt.hash(password, 12),
          status: "APPROVED",
          role: "ADMIN",
          canApprove: true,
        },
      });
      console.log(`Created admin account ${email}`);
    } else {
      console.log(`Admin account ${email} already exists`);
    }
  }

  const defaults = {
    liveTitle: "Live Shiur",
    liveJoinUrl: "",
    liveSchedule: "",
    courseOpen: "false",
    coursePrice: "0",
    courseTitle: "Mashgiach Training Course",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log("Seed complete");
}

main().finally(() => prisma.$disconnect());

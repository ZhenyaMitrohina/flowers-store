import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@flowers.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme";
  const hash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    create: { email, passwordHash: hash },
    update: { passwordHash: hash },
  });

  const seeds = [
    { name: "Цветы", slug: "flowers", sortOrder: 0 },
    { name: "Шары", slug: "balloons", sortOrder: 1 },
    { name: "Игрушки", slug: "toys", sortOrder: 2 },
  ] as const;

  for (const c of seeds) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: c,
      update: { name: c.name, sortOrder: c.sortOrder },
    });
  }

  const flowers = await prisma.category.findUniqueOrThrow({ where: { slug: "flowers" } });
  const demo = await prisma.product.findFirst({ where: { name: "Роза красная (демо)" } });
  if (!demo) {
    await prisma.product.create({
      data: {
        name: "Роза красная (демо)",
        description: "Стартовая позиция из seed.",
        price: "199.00",
        discountType: "NONE",
        discountValue: "0",
        imageUrls: [],
        isActive: true,
        categoryId: flowers.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

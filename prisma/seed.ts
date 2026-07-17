import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting database seed execution...");

  const defaultHashedPassword = await bcrypt.hash("password123", 12);

  // 1. Seed System Level Authorization Roles
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER" },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

  // 2. Seed Base Profiles (Admin & General Test User)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@backlog.com" },
    update: {},
    create: {
      supabase_id: "mock-supabase-admin-uuid",
      name: "Super Admin",
      handle: "admin",
      email: "admin@backlog.com",
      password: defaultHashedPassword,
      role_id: adminRole.id,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: "playerone@backlog.com" },
    update: {},
    create: {
      supabase_id: "mock-supabase-user-uuid",
      name: "Player One",
      handle: "player1",
      email: "playerone@backlog.com",
      password: defaultHashedPassword,
      role_id: userRole.id,
      bio: "Just a casual gamer tracking my backlog collections.",
    },
  });

  // 3. Seed Base Genres
  const rpgGenre = await prisma.genre.upsert({
    where: { name: "RPG" },
    update: {},
    create: { name: "RPG" },
  });

  const actionGenre = await prisma.genre.upsert({
    where: { name: "Action" },
    update: {},
    create: { name: "Action" },
  });

  // 4. Seed a Sample Game Record (Scaled average rating to 1-10 scale)
  const witcherGame = await prisma.game.create({
    data: {
      title: "The Witcher 3: Wild Hunt",
      release_date: new Date("2015-05-19"),
      cover_image:
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
      description:
        "A story-driven, next-generation open world role-playing game set in a visually stunning fantasy universe full of meaningful choices and impactful consequences.",
      rating_avg: 9.6, // Scaled from 4.8/5 to 9.6/10
      game_genres: {
        create: [{ genre_id: rpgGenre.id }, { genre_id: actionGenre.id }],
      },
    },
  });

  // 5. Seed a Contextual User Review (Scaled rating to 1-10 scale)
  await prisma.review.create({
    data: {
      game_id: witcherGame.id,
      user_id: regularUser.id,
      title: "An Absolute Masterpiece of Storytelling",
      body: "The writing, characters, and side quests are top-tier. Even years after launch, the world feels incredibly alive and holds up against modern titles.",
      rating: 10, // Scaled from 5/5 to 10/10
      recommended: true,
    },
  });

  console.log(
    "Core application roles, users, games, and reviews seeded successfully!",
  );
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

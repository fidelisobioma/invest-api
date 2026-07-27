import { prisma } from "./lib/prisma.ts";
async function main() {
  // Create a new user
  const user = await prisma.user.create({
    data: {
      email: "mbamfidelisobioma@gmail.com",
      password: "fidelis123",
      name: "Fidelis",
    },
  });

  console.log("Created user:", user);

  //   Fetch all users
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users, null, 2));
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

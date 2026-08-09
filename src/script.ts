import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma.ts";

const SALT_ROUNDS = 10;

async function main() {
  // --- Seed a test user (idempotent: upsert by email) ---
  const hashedPassword = await bcrypt.hash("fidelis123", SALT_ROUNDS);

  const user = await prisma.user.upsert({
    where: { email: "mbamfidelisobioma@gmail.com" },
    update: {}, // already exists — leave it untouched
    create: {
      email: "mbamfidelisobioma@gmail.com",
      password: hashedPassword,
      name: "Fidelis",
    },
  });

  console.log("User ready:", user.email);

  const adminPassword = await bcrypt.hash("admin12345", SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: "mbamfidelisobioma1@gmail.com" },
    update: {},
    create: {
      email: "mbamfidelisobioma1@gmail.com",
      password: adminPassword,
      name: "Vault Admin",
      role: "ADMIN",
    },
  });

  console.log("Admin ready:", admin.email);

  // --- Seed admin wallets (idempotent: upsert by coin+network) ---
  const adminWallets = [
    {
      coin: "BTC",
      network: "Bitcoin",
      address: "bc1q3et6n9ncddnul3ckx2rlcrm3pfc5a6gegeypk5",
    },
    {
      coin: "ETH",
      network: "Ethereum",
      address: "0x133Be29D1dEa546FB0854030B53624Ef063ba022",
    },
    {
      coin: "USDT",
      network: "Tron (TRC20)",
      address: "THhVRFdUTNSitmFRpBMjuTZoFtbEtEne37",
    },
    {
      coin: "BNB",
      network: "BNB Smart Chain",
      address: "0x133Be29D1dEa546FB0854030B53624Ef063ba022",
    },
    {
      coin: "SOL",
      network: "Solana",
      address: "EsupYF6E7426T8cPWfvShE3UhE98ayTaAzzBvhUAH52w",
    },
  ];

  for (const wallet of adminWallets) {
    const result = await prisma.adminWallet.upsert({
      where: {
        coin_network: {
          coin: wallet.coin,
          network: wallet.network,
        },
      },
      update: {},
      create: wallet,
    });
    console.log(`Admin wallet ready: ${result.coin} (${result.network})`);
  }

  const plans = [
    {
      name: "Starter",
      minAmountUsd: "50",
      maxAmountUsd: "500",
      roiPercent: "10",
      durationDays: 7,
    },
    {
      name: "Pro",
      minAmountUsd: "500",
      maxAmountUsd: "5000",
      roiPercent: "20",
      durationDays: 14,
    },
    {
      name: "VIP",
      minAmountUsd: "5000",
      maxAmountUsd: "50000",
      roiPercent: "35",
      durationDays: 30,
    },
  ];
  for (const plan of plans) {
    const result = await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
    console.log(`Plan ready: ${result.name}`);
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

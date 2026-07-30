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

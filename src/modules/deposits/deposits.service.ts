import QRCode from "qrcode";
import { AppError } from "../../lib/error.ts";
import { prisma } from "../../lib/prisma.ts";

export async function getDepositAddress(coin: string) {
  const wallet = await prisma.adminWallet.findFirst({
    where: { coin, isActive: true },
  });

  if (!wallet) {
    throw new AppError(`No active deposit address configured for ${coin}`, 404);
  }

  const qrCode = await QRCode.toDataURL(wallet.address);

  return {
    coin: wallet.coin,
    network: wallet.network,
    address: wallet.address,
    qrCode,
  };
}

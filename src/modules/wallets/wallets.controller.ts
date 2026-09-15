import type { Request, Response, NextFunction } from "express";
import * as walletsService from "./wallets.service.ts";
import type {
  UpsertWalletInput,
  SetWalletActiveInput,
} from "./wallets.types.ts";

export async function listWalletsHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const wallets = await walletsService.listWallets();
    res.status(200).json({ wallets });
  } catch (err) {
    next(err);
  }
}

export async function upsertWalletHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = req.body as UpsertWalletInput;
    const wallet = await walletsService.upsertWallet(input);
    res.status(200).json({ wallet });
  } catch (err) {
    next(err);
  }
}

export async function setWalletActiveHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { isActive } = req.body as SetWalletActiveInput;
    const wallet = await walletsService.setWalletActive(
      req.params.id as string,
      isActive,
    );
    res.status(200).json({ wallet });
  } catch (err) {
    next(err);
  }
}

import { Decimal } from "decimal.js";
import { AppError } from "../../lib/error.ts";

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
};

type PriceCacheEntry = {
  price: Decimal;
  fetchedAt: number;
};

// In-memory only — resets on server restart, which is fine since prices
// are re-fetched on demand. Short TTL keeps values fresh without hitting
// CoinGecko on every single request (their free tier is rate-limited).
const priceCache = new Map<string, PriceCacheEntry>();
const CACHE_TTL_MS = 60_000;

/**
 * Returns the current USD price of one unit of `coin`.
 *
 * On a transient CoinGecko failure, falls back to the last successfully
 * fetched price for that coin rather than failing the whole request —
 * a slightly stale price is far better than blocking every investment
 * because of a momentary upstream hiccup. Only throws if there is no
 * cached price at all to fall back on.
 */
export async function getUsdPrice(coin: string): Promise<Decimal> {
  const cached = priceCache.get(coin);

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.price;
  }

  const geckoId = COINGECKO_IDS[coin];
  if (!geckoId) {
    throw new AppError(`No price source configured for ${coin}`, 500);
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`,
    );

    if (!response.ok) {
      throw new Error(`CoinGecko responded with status ${response.status}`);
    }

    const data = (await response.json()) as Record<string, { usd?: number }>;
    const usdPrice = data[geckoId]?.usd;

    if (usdPrice === undefined) {
      throw new Error(
        `CoinGecko response did not include a USD price for ${geckoId}`,
      );
    }

    const price = new Decimal(usdPrice);
    priceCache.set(coin, { price, fetchedAt: Date.now() });
    return price;
  } catch (err) {
    if (cached) {
      return cached.price;
    }
    throw new AppError(
      `Unable to fetch the current ${coin} price. Please try again shortly.`,
      503,
    );
  }
}

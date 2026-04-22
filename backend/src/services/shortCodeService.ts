import { nanoid } from "nanoid";
import { hasShortCode, hasStatsCode } from "./dataStore.js";

export async function generateUniqueCodes() {
  let shortCode = nanoid(7);
  let statsCode = nanoid(18);

  while (await hasShortCode(shortCode)) {
    shortCode = nanoid(7);
  }

  while (await hasStatsCode(statsCode)) {
    statsCode = nanoid(18);
  }

  return { shortCode, statsCode };
}

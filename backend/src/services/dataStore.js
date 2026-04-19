import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const dataPath = path.resolve(process.cwd(), "src", "data", "db.json");

let writeChain = Promise.resolve();

const defaultData = {
  links: [],
  clicks: [],
};

async function ensureDbFile() {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });

  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  writeChain = writeChain.then(() => fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8"));
  return writeChain;
}

export async function createShortLink({ originalUrl, shortCode, statsCode }) {
  const db = await readDb();
  const now = new Date().toISOString();

  const record = {
    id: nanoid(12),
    originalUrl,
    shortCode,
    statsCode,
    createdAt: now,
  };

  db.links.push(record);
  await writeDb(db);

  return record;
}

export async function getLinkByShortCode(shortCode) {
  const db = await readDb();
  return db.links.find((item) => item.shortCode === shortCode) || null;
}

export async function getLinkByStatsCode(statsCode) {
  const db = await readDb();
  return db.links.find((item) => item.statsCode === statsCode) || null;
}

export async function hasShortCode(shortCode) {
  const found = await getLinkByShortCode(shortCode);
  return Boolean(found);
}

export async function hasStatsCode(statsCode) {
  const found = await getLinkByStatsCode(statsCode);
  return Boolean(found);
}

export async function addClick(entry) {
  const db = await readDb();

  const click = {
    id: nanoid(14),
    ...entry,
  };

  db.clicks.push(click);
  await writeDb(db);

  return click;
}

export async function getStatsByLinkId(linkId) {
  const db = await readDb();
  return db.clicks.filter((item) => item.linkId === linkId);
}

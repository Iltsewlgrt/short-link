import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma.js";

function mapLink(link: {
  id: string;
  originalUrl: string;
  shortCode: string;
  statsCode: string;
  createdAt: Date;
}) {
  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    statsCode: link.statsCode,
    createdAt: link.createdAt.toISOString(),
  };
}

function mapClick(click: {
  id: string;
  linkId: string;
  timestamp: Date;
  ip: string;
  region: string;
  country: string;
  city: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  userAgent: string;
}) {
  return {
    id: click.id,
    linkId: click.linkId,
    timestamp: click.timestamp.toISOString(),
    ip: click.ip,
    region: click.region,
    country: click.country,
    city: click.city,
    browserName: click.browserName,
    browserVersion: click.browserVersion,
    osName: click.osName,
    osVersion: click.osVersion,
    userAgent: click.userAgent,
  };
}

export async function createShortLink({ originalUrl, shortCode, statsCode }) {
  const record = await prisma.link.create({
    data: {
      id: nanoid(12),
      originalUrl,
      shortCode,
      statsCode,
      createdAt: new Date(),
    },
  });

  return mapLink(record);
}

export async function getLinkByShortCode(shortCode) {
  const link = await prisma.link.findUnique({
    where: { shortCode },
  });

  return link ? mapLink(link) : null;
}

export async function getLinkByStatsCode(statsCode) {
  const link = await prisma.link.findUnique({
    where: { statsCode },
  });

  return link ? mapLink(link) : null;
}

export async function hasShortCode(shortCode) {
  const count = await prisma.link.count({
    where: { shortCode },
  });

  return count > 0;
}

export async function hasStatsCode(statsCode) {
  const count = await prisma.link.count({
    where: { statsCode },
  });

  return count > 0;
}

export async function addClick(entry) {
  const click = await prisma.click.create({
    data: {
      id: nanoid(14),
      linkId: entry.linkId,
      timestamp: new Date(entry.timestamp),
      ip: entry.ip,
      region: entry.region,
      country: entry.country,
      city: entry.city,
      browserName: entry.browserName,
      browserVersion: entry.browserVersion,
      osName: entry.osName,
      osVersion: entry.osVersion,
      userAgent: entry.userAgent,
    },
  });

  return mapClick(click);
}

export async function getStatsByLinkId(linkId) {
  const clicks = await prisma.click.findMany({
    where: { linkId },
  });

  return clicks.map(mapClick);
}

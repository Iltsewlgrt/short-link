import UAParser from "ua-parser-js";
import { config } from "../config.js";
import { CLICK_DEDUPE_WINDOW_MS, CLICK_HARD_DEDUPE_WINDOW_MS } from "../constants.js";
import {
  addClick,
  createShortLink,
  getLinkByShortCode,
  getStatsByLinkId,
} from "./dataStore.js";
import { resolveGeo } from "./geoService.js";
import { generateUniqueCodes } from "./shortCodeService.js";
import { isPrivateIp } from "../utils/ip.js";
import { normalizeUrl } from "../utils/validate.js";

const BOT_UA_PATTERN =
  /(bot|spider|crawler|preview|facebookexternalhit|telegrambot|slackbot|discordbot|whatsapp|curl|wget|python-requests|okhttp|headless)/i;

const recentClickGuards = new Map();

function shouldSkipByInMemoryDedupe(linkId, ip, softSignature, now) {
  const hardKey = `${linkId}|${ip}`;
  const hardTs = recentClickGuards.get(hardKey);
  if (typeof hardTs === "number" && now - hardTs >= 0 && now - hardTs <= CLICK_HARD_DEDUPE_WINDOW_MS) {
    return true;
  }

  const softKey = `${linkId}|${ip}|${softSignature}`;
  const softTs = recentClickGuards.get(softKey);

  if (typeof softTs === "number" && now - softTs >= 0 && now - softTs <= CLICK_DEDUPE_WINDOW_MS) {
    return true;
  }

  recentClickGuards.set(hardKey, now);
  recentClickGuards.set(softKey, now);

  if (recentClickGuards.size > 5000) {
    for (const [storedKey, ts] of recentClickGuards.entries()) {
      if (now - ts > CLICK_DEDUPE_WINDOW_MS * 2) {
        recentClickGuards.delete(storedKey);
      }
    }
  }

  return false;
}

function parseWindowsMajorVersionFromClientHints(headers) {
  const raw = String(headers?.["sec-ch-ua-platform-version"] || "").replace(/"/g, "").trim();
  if (!raw) {
    return null;
  }

  const major = Number.parseInt(raw.split(".")[0], 10);
  return Number.isFinite(major) ? major : null;
}

function resolveOs(ua, headers) {
  const osName = ua.os.name || "Unknown";
  let osVersion = ua.os.version || "Unknown";

  if (osName === "Windows" && osVersion === "10") {
    const major = parseWindowsMajorVersionFromClientHints(headers || {});

    if (major !== null && major >= 13) {
      osVersion = "11";
    } else if (major !== null) {
      osVersion = "10";
    } else {
      // Without Client Hints Windows NT 10.0 is ambiguous (10 or 11).
      osVersion = "10/11";
    }
  }

  return { osName, osVersion };
}

function normalizeClicks(clicks) {
  return clicks
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((click) => {
      const isUnknownGeo =
        (click.country || "Unknown") === "Unknown" &&
        (click.region || "Unknown") === "Unknown" &&
        (click.city || "Unknown") === "Unknown";

      if (!isUnknownGeo || !isPrivateIp(click.ip || "")) {
        return click;
      }

      return {
        ...click,
        country: "Local",
        region: "Local network",
        city: "Localhost",
      };
    });
}

function buildStatsPayload(link, clicks) {
  return {
    link: {
      id: link.id,
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      statsCode: link.statsCode,
      createdAt: link.createdAt,
      shareUrl: `${config.baseUrl}/${link.shortCode}`,
      statsUrl: `${config.baseUrl}/${link.shortCode}+`,
      statsPageUrl: `${config.frontendBaseUrl}/#/stats/${link.shortCode}`,
    },
    totalClicks: clicks.length,
    clicks: normalizeClicks(clicks),
  };
}

function shouldTrackClick({ userAgent, headers, ua }) {
  const uaText = String(userAgent || "").trim();
  const purpose = String(headers["purpose"] || headers["sec-purpose"] || headers["x-purpose"] || "").toLowerCase();
  const mozPrefetch = String(headers["x-moz"] || "").toLowerCase();

  if (!uaText || uaText === "Unknown") {
    return false;
  }

  if (purpose.includes("prefetch") || mozPrefetch.includes("prefetch")) {
    return false;
  }

  if (BOT_UA_PATTERN.test(uaText)) {
    return false;
  }

  if ((ua.browser.name || "Unknown") === "Unknown" && (ua.os.name || "Unknown") === "Unknown") {
    return false;
  }

  return true;
}

export async function createShortLinkByUrl(rawUrl) {
  const normalizedUrl = normalizeUrl(rawUrl);
  if (!normalizedUrl) {
    return null;
  }

  const { shortCode, statsCode } = await generateUniqueCodes();
  const link = await createShortLink({
    originalUrl: normalizedUrl,
    shortCode,
    statsCode,
  });

  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shareUrl: `${config.baseUrl}/${shortCode}`,
    statsUrl: `${config.baseUrl}/${shortCode}+`,
    statsPageUrl: `${config.frontendBaseUrl}/#/stats/${shortCode}`,
    shortCode,
    statsCode,
    createdAt: link.createdAt,
  };
}

export async function getStatsByShortCode(shortCode) {
  const link = await getLinkByShortCode(shortCode);
  if (!link) {
    return null;
  }

  const clicks = await getStatsByLinkId(link.id);
  return buildStatsPayload(link, clicks);
}

export async function getStatsPageDestinationByShortCode(shortCode) {
  const link = await getLinkByShortCode(shortCode);
  if (!link) {
    return null;
  }

  return `${config.frontendBaseUrl}/#/stats/${shortCode}`;
}

export async function resolveShareRedirect({ shortCode, ip, userAgent, headers }) {
  const link = await getLinkByShortCode(shortCode);
  if (!link) {
    return { kind: "not_found" };
  }

  const ua = new UAParser(userAgent).getResult();
  const os = resolveOs(ua, headers || {});
  const browserName = ua.browser.name || "Unknown";
  const browserVersion = ua.browser.version || "Unknown";
  const osName = os.osName;
  const osVersion = os.osVersion;
  const softSignature = `${browserName}|${osName}|${osVersion}`;
  const now = Date.now();

  const existingClicks = await getStatsByLinkId(link.id);
  const isDuplicate = existingClicks.some((click) => {
    const clickTs = new Date(click.timestamp).getTime();
    if (!Number.isFinite(clickTs)) {
      return false;
    }

    if (click.ip !== ip || now - clickTs < 0) {
      return false;
    }

    if (now - clickTs <= CLICK_HARD_DEDUPE_WINDOW_MS) {
      return true;
    }

    if (now - clickTs > CLICK_DEDUPE_WINDOW_MS) {
      return false;
    }

    if (click.userAgent === userAgent) {
      return true;
    }

    return (
      (click.browserName || "Unknown") === browserName &&
      (click.osName || "Unknown") === osName &&
      (click.osVersion || "Unknown") === osVersion
    );
  });

  if (isDuplicate) {
    return { kind: "duplicate", destination: link.originalUrl };
  }

  if (!shouldTrackClick({ userAgent, headers: headers || {}, ua })) {
    return { kind: "skipped", destination: link.originalUrl };
  }

  if (shouldSkipByInMemoryDedupe(link.id, ip, softSignature, now)) {
    return { kind: "duplicate", destination: link.originalUrl };
  }

  const geo = await resolveGeo(ip);

  await addClick({
    linkId: link.id,
    timestamp: new Date().toISOString(),
    ip,
    region: geo.region,
    country: geo.country,
    city: geo.city,
    browserName,
    browserVersion,
    osName,
    osVersion,
    userAgent,
  });

  return {
    kind: "tracked",
    destination: link.originalUrl,
    geo,
  };
}

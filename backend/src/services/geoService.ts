import { config } from "../config.js";
import { isPrivateIp } from "../utils/ip.js";

const fallback = {
  country: "Unknown",
  region: "Unknown",
  city: "Unknown",
};

const localFallback = {
  country: "Local",
  region: "Local network",
  city: "Localhost",
};

function getGeoEndpoint(ip) {
  const base = config.geoApiUrl.replace(/\/+$/, "");
  const fields = "status,country,regionName,city";

  if (ip) {
    return `${base}/${encodeURIComponent(ip)}?fields=${fields}`;
  }

  return `${base}?fields=${fields}`;
}

async function fetchGeo(ip) {
  const endpoint = getGeoEndpoint(ip);

  const response = await fetch(endpoint);

  if (!response.ok) {
    return null;
  }

  const payload: any = await response.json();
  if (payload.status !== "success") {
    return null;
  }

  return {
    country: payload.country || "Unknown",
    region: payload.regionName || "Unknown",
    city: payload.city || "Unknown",
  };
}

async function fetchGeoFallback(ip) {
  const base = (config.geoFallbackApiUrl || "https://ipwho.is").replace(/\/+$/, "");
  const endpoint = ip ? `${base}/${encodeURIComponent(ip)}` : base;

  const response = await fetch(endpoint);
  if (!response.ok) {
    return null;
  }

  const payload: any = await response.json();
  if (!payload.success) {
    return null;
  }

  return {
    country: payload.country || "Unknown",
    region: payload.region || "Unknown",
    city: payload.city || "Unknown",
  };
}

async function resolveFromProviders(ip?) {
  const primary = await fetchGeo(ip);
  if (primary) {
    return primary;
  }

  const fallbackProvider = await fetchGeoFallback(ip);
  return fallbackProvider;
}

export async function resolveGeo(ip) {
  if (!ip || ip === "unknown") {
    return fallback;
  }

  const privateIp = isPrivateIp(ip);

  try {
    if (privateIp) {
      const serverGeo = await resolveFromProviders();
      return serverGeo || localFallback;
    }

    const resolved = await resolveFromProviders(ip);
    return resolved || fallback;
  } catch {
    return privateIp ? localFallback : fallback;
  }
}

function normalizeApiBase(rawBase) {
  const fallback = "http://localhost:4000/api";
  const base = String(rawBase || fallback).trim().replace(/\/+$/, "");

  if (base.toLowerCase().endsWith("/api")) {
    return base;
  }

  return `${base}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }

  return payload;
}

export async function createLink(url) {
  return request("/links", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function fetchStats(shortCode) {
  return request(`/stats/by-short/${shortCode}`);
}

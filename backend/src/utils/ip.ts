const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^::ffff:127\./i,
  /^::ffff:10\./i,
  /^::ffff:169\.254\./i,
  /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./i,
  /^::ffff:192\.168\./i,
  /^fc00:/i,
  /^fe80:/i,
];

function normalizeIp(ip) {
  if (typeof ip !== "string") {
    return "unknown";
  }

  const value = ip.trim();
  if (!value) {
    return "unknown";
  }

  return value;
}

export function extractClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return normalizeIp(forwardedFor.split(",")[0]);
  }

  return normalizeIp(req.socket?.remoteAddress);
}

export function isPrivateIp(ip) {
  const normalized = normalizeIp(ip);
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(normalized));
}

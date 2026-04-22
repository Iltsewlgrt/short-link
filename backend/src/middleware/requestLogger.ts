let requestCounter = 0;

export function requestLogger(req, res, next) {
  requestCounter += 1;
  const requestId = requestCounter;
  const startedAt = Date.now();
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

  req.requestId = requestId;
  console.log(`[REQ ${requestId}] ${req.method} ${req.originalUrl} ip=${ip}`);

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`[RES ${requestId}] ${res.statusCode} ${req.method} ${req.originalUrl} ${durationMs}ms`);
  });

  next();
}

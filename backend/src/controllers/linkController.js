import { config } from "../config.js";
import { extractClientIp } from "../utils/ip.js";
import { setNoStoreCache } from "../utils/httpCache.js";
import {
  createShortLinkByUrl,
  getStatsByShortCode,
  getStatsPageDestinationByShortCode,
  resolveShareRedirect,
} from "../services/linkService.js";

export function healthController(req, res) {
  setNoStoreCache(res);
  res.json({ status: "ok" });
}

export async function createLinkController(req, res, next) {
  try {
    setNoStoreCache(res);

    const payload = await createShortLinkByUrl(req.body?.url);
    if (!payload) {
      return res.status(400).json({ message: "Некорректный URL" });
    }

    console.log(
      `[LINK ${req.requestId || "-"}] created shortCode=${payload.shortCode} target=${payload.originalUrl} share=${payload.shareUrl} stats=${payload.statsUrl}`
    );

    return res.status(201).json(payload);
  } catch (error) {
    return next(error);
  }
}

export async function getStatsByShortCodeController(req, res, next) {
  try {
    setNoStoreCache(res);

    const stats = await getStatsByShortCode(req.params.shortCode);
    if (!stats) {
      return res.status(404).json({ message: "Статистика не найдена" });
    }

    return res.json(stats);
  } catch (error) {
    return next(error);
  }
}

export async function redirectToStatsController(req, res, next) {
  try {
    setNoStoreCache(res);

    const shortCode = req.params[0];
    const destination = await getStatsPageDestinationByShortCode(shortCode);
    if (!destination) {
      return res.status(404).json({ message: "Ссылка не найдена" });
    }

    console.log(
      `[STATS_REDIRECT ${req.requestId || "-"}] short=${config.baseUrl}/${shortCode}+ ui=${destination}`
    );

    return res.redirect(destination);
  } catch (error) {
    return next(error);
  }
}

export async function redirectByShortCodeController(req, res, next) {
  try {
    setNoStoreCache(res);

    const shortCode = req.params.shortCode;
    const ip = extractClientIp(req);
    const userAgent = req.headers["user-agent"] || "Unknown";

    const result = await resolveShareRedirect({
      shortCode,
      ip,
      userAgent,
      headers: req.headers,
    });

    if (result.kind === "not_found") {
      return res.status(404).json({ message: "Ссылка не найдена" });
    }

    if (result.kind === "duplicate") {
      console.log(
        `[REDIRECT_DUPLICATE ${req.requestId || "-"}] shortCode=${shortCode} ip=${ip} skipped_click=true -> ${result.destination}`
      );
      return res.redirect(result.destination);
    }

    if (result.kind === "skipped") {
      console.log(
        `[REDIRECT_SKIPPED ${req.requestId || "-"}] shortCode=${shortCode} ip=${ip} reason=bot_or_prefetch ua=${userAgent}`
      );
      return res.redirect(result.destination);
    }

    console.log(
      `[REDIRECT ${req.requestId || "-"}] shortCode=${shortCode} ip=${ip} geo=${result.geo.country}/${result.geo.region}/${result.geo.city} -> ${result.destination}`
    );

    return res.redirect(result.destination);
  } catch (error) {
    return next(error);
  }
}

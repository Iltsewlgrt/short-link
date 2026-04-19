import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  baseUrl: process.env.BASE_URL || "http://localhost:4000",
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || "http://localhost:5173",
  geoApiUrl: process.env.GEO_API_URL || "http://ip-api.com/json",
  geoFallbackApiUrl: process.env.GEO_FALLBACK_API_URL || "https://ipwho.is",
};

import express from "express";
import {
  createLinkController,
  getStatsByShortCodeController,
  healthController,
} from "../controllers/linkController.js";

const router = express.Router();

router.get("/health", healthController);
router.post("/links", createLinkController);
router.get("/stats/by-short/:shortCode", getStatsByShortCodeController);

export default router;

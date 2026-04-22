import express from "express";
import {
  redirectByShortCodeController,
  redirectToStatsController,
} from "../controllers/linkController.js";

const router = express.Router();

router.get(/^\/([A-Za-z0-9_-]+)\+$/, redirectToStatsController);
router.get("/:shortCode", redirectByShortCodeController);

export default router;

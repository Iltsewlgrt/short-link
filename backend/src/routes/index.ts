import express from "express";
import apiRoutes from "./apiRoutes.js";
import redirectRoutes from "./redirectRoutes.js";

const router = express.Router();

router.use("/api", apiRoutes);
router.use("/", redirectRoutes);

export default router;

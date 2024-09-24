import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller";

const router = Router();
router.use(verifyToken);

router.get("/stats", getChannelStats);
router.get("/video", getChannelVideos);

export default router;

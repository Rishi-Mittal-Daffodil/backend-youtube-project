import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import {
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controller";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;

import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import {
  createTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;

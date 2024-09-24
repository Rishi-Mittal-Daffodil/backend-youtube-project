import { Router } from "express";
import {
  addComment,
  deleteComment,
  updateComment,
  getVideoComments,
} from "../controllers/comment.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.get("/:videoId", getVideoComments);
router.post("/:videoId", addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;


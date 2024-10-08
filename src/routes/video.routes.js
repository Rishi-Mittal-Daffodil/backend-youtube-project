import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
} from "../controllers/video.controller";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;

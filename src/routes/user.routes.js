import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  otpverification,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.post('/login/verify-otp' , otpverification)
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyToken, changePassword);
router.get("/current-user", verifyToken, getCurrentUser);
router.patch("/update-account", verifyToken, updateAccountDetails);
router.patch("/avatar", verifyToken, upload.single("avatar"), updateAvatar);
router.patch(
  "/cover-image",
  verifyToken,
  upload.single("coverImage"),
  updateCoverImage
);

export default router;

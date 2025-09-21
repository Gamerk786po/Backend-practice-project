import { Router } from "express";
import {
  getChannelInfo,
  getUser,
  loginUser,
  logoutUser,
  regenerateRefreshAndAccessTokens,
  registerUser,
  updateAvatar,
  updatePassword,
  updateUserName,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

router.route("/refresh").post(regenerateRefreshAndAccessTokens);

// Secure routes
router.route("/logout").post(jwtVerify, logoutUser);

router.route("/userName").patch(jwtVerify, updateUserName);

router.route("/password").patch(jwtVerify, updatePassword);

router.route("/getUser").get(jwtVerify, getUser);

router.route("/avatar").patch(jwtVerify, upload.single("avatar"), updateAvatar);

router.route("/getChannelInfo").get(jwtVerify, getChannelInfo);

export default router;
import { Router } from "express";
import {
  getUser,
  loginUser,
  logoutUser,
  regenerateRefreshAndAccessTokens,
  registerUser,
  updatePassword,
  updateUserName,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

router.route("/refresh").post(regenerateRefreshAndAccessTokens);
// Secure routes
router.route("/logout").post(jwtVerify, logoutUser);

router.route("/userName").patch(jwtVerify, updateUserName);

router.route("/password").patch(jwtVerify, updatePassword);

router.route("/getUser").get(jwtVerify, getUser);

export default router;

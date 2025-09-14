import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const jwtVerify = async (req, res, next) => {
  try {
    // Getting Token from request
    const token =
      req.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer-", "");

    if (!token) {
      throw new ApiError(401, "unautherized token");
    }
    // decoding the token
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(401, "Invalid Access Token");
    }

    const user = await User.findById(decodedToken._id);
    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, error.message || "Invalid Access Token"));
  }
};

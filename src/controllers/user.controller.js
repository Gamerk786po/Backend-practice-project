import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Method for generating Refresh and Access Tokens
const generateRefreshAndAccessTokens = async (_id) => {
  try {
    const user = await User.findById(_id);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Getting data from request
  const { userName, email, password } = req.body;

  // Validation if data is empty or not
  if ([userName, email, password].some((data) => data?.trim() == "")) {
    throw new ApiError(400, "Fields are required");
  }

  // Checking if this user exist in db already or not
  const userExistance = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (userExistance) {
    throw new ApiError(409, "UserName or Email already exists");
  }
  // Uploading the avatar to localPath
  const avatarLocalPath = req.file?.path;
  // Checking if localFilePath exists
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // uploading this avatar file to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);
  // Checking if file is uploaded to cloudinary
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Creating user in db
  const user = await User.create({
    userName: userName,
    email: email,
    password: password,
    avatar: avatar.url,
  });
  // Geting user from db using id
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // Checking if user is created
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while uploading user");
  }
  // Response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "Successfully registered user"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Getting data from request
  const { userName, email, password } = req.body;

  // Checking if there is email or userName is in requst or not
  if (!userName && !email) {
    throw new ApiError(401, "UserName or Email is required");
  }

  // Geting user from db
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "The user not found");
  }

  // Password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Succesfully logged out."));
});

const regenerateRefreshAndAccessTokens = asyncHandler(async (req, res) => {
  // Geting oldRefreshToken from cookies
  const oldRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!oldRefreshToken) {
    throw new ApiError(401, "Unauthorized Token");
  }

  // Decoding the oldRefreshToken
  const decodedOldToken = jwt.verify(
    oldRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  if (!decodedOldToken) {
    throw new ApiError(401, "Invalid Token");
  }

  // Getting user by id
  const user = await User.findById(decodedOldToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
  if (user.refreshToken !== oldRefreshToken) {
    throw new ApiError(401, "The Refresh Token is used or expiried");
  }

  // Regenerating newAccessToken and newRefreshToken
  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(
    user._id
  );

  // Cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Generating a response
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { refreshToken, accessToken },
        "New refresh and Access Tokens created successfully"
      )
    );
});

const updateUserName = asyncHandler(async (req, res) => {
  const { newUserName } = req.body;

  if (!newUserName) {
    throw new ApiError(400, "userName is required");
  }

  try {
    // Finding and updating
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          userName: newUserName,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json(new ApiResponse(200, user, "userName successfully updated"));
  } catch (error) {
    if (error.code === 11000) {
      // Error if duplicate username
      throw new ApiError(409, "userName already exists");
    }
    throw new ApiError(500, "Error while updating userName in DB");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  regenerateRefreshAndAccessTokens,
  updateUserName,
};

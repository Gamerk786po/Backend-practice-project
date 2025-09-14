import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    "-pasword -refreshToken"
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
export { registerUser, loginUser, logoutUser };

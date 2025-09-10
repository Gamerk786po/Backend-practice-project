import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js"
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res, next) => {

    // Getting data from request
    const { userName, email, password } = req.body;
    
    // Validation if data is empty or not
    if([userName, email, password].some((data) => data?.trim() == "")){
        throw new ApiError(400, "Fields are required");
    }

    // Checking if this user exist in db already or not
    const userExistance = await User.findOne({
        $or: [{userName}, {email}]
    })

    if(userExistance){
        throw new ApiError(409, "UserName or Email already exists")
    }

    // Uploading the avatar to localPath
    const avatarLocalPath = req.file?.path;
    // Checking if localFilePath exists
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // uploading this avatar file to cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath);
    // Checking if file is uploaded to cloudinary
    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    // Creating user in db
    const user = await User.create({
        userName: userName,
        email: email,
        password: password,
        avatar: avatar.url
    })
    // Geting user from db using id
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // Checking if user is created
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while uploading user")
    }
    // Response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "Successfully registered user")
    )
})

export {registerUser};
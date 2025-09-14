import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("✅ Cloudinary configured with:", process.env.CLOUDINARY_CLOUD_NAME);

// Function for Uploading files to Cloudinary
const uploadToCloudinary = async (localPath) => {
  try {
    if (!localPath) return null;

    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localPath);
    return response;
  } catch (error) {
    try {
      fs.unlinkSync(localPath);
    } catch (error) {
      console.log(`Unable to delete at ${localPath} err: ${error}`);
    }
    console.log(`Unable to upload file to cloudinary err: ${error}`);
    return null;
  }
};

export { uploadToCloudinary };

import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

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

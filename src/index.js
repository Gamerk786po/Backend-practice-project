import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import dbConnect from "./db/dbconnect.js";
import { v2 as cloudinary } from "cloudinary";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary configured with:", process.env.CLOUDINARY_CLOUD_NAME);



dbConnect()
  .then(() => {
    app.listen( PORT , "0.0.0.0", () => {
      console.log(`Server is runing that http://localhost:${PORT}.`);
    });
  })
  .catch((error) => {
    console.log(`Mongo DB failed to connect ${error}`);
  });

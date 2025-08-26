import { DB_Name } from "../constants.js";
import mongoose from "mongoose";

// Function for db connection
const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${DB_Name}`
    );
    console.log(connectionInstance.connection);
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Error occured", error);
    process.exit(1);
  }
};

export default dbConnect;

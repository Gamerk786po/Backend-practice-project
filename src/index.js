import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./db/dbconnect.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

dbConnect()
  .then(() => {
    app.listen( PORT , "0.0.0.0", () => {
      console.log(`Server is runing that http://localhost:${PORT}.`);
    });
  })
  .catch((error) => {
    console.log(`Mongo DB failed to connect ${error}`);
  });

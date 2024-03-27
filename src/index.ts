import express, { Request, Response } from "express";
import cors from "cors";
import {v2 as cloudinary} from 'cloudinary'
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import myRestaurantRoute from "./routes/MyRestaurantRoute";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to the database"));


  //cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();

//Middlewares
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({
    message: "Health OK",
  });
});

//Endpoints
app.use("/api/my/user", myUserRoute);
app.use("/api/my/restaurant", myRestaurantRoute)

const PORT = 7000 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

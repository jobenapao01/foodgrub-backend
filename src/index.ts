import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to the database"));

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

const PORT = 7000 || process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});

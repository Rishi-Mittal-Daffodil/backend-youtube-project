import express, { urlencoded } from "express";
import dotenv from "dotenv";
import DB_CONNECT from "./DB/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
dotenv.config({
  path: "./.env",
});

app.use(
  // cors({
  //   origin: process.env.CORS_ORIGIN,
  //   credentials: true,
  // })
  cors()
);
app.use(express.json({ limit: "500kb" }));
app.use(urlencoded({ extended: true, limit: "500kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//importing routes
import userRoutes from "./routes/user.routes.js";
// import tweetRouter from "./routes/tweet.routes.js"

//use routes in middleware  .
app.use("/api/v1/user", userRoutes);
// app.use("/api/v1/router" , tweetRouter) ; 

const PORT = process.env.PORT || 8000;
DB_CONNECT()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Connected at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error occured in DB Connection", err);
  });

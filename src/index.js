import express, { urlencoded } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import DB_CONNECT from "./DB/index.js";
import cookieParser from "cookie-parser";
const app = express();
dotenv.config();

app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const PORT = 8000;
DB_CONNECT()
  .then(() => {
    app.listen(PORT || 8000, () => {
      console.log(`Server Connected at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error occured in DB Connection", err);
  });

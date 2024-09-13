import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DB_CONNECT = async () => {
  try {
    const instanceConnection = await mongoose.connect(
      `${process.env.DB_URI}/${DB_NAME}`
    );
    console.log(
      "DB Connected SucessFully ",
      instanceConnection.connection.host
    );
  } catch (err) {
    console.log("Mongo connection failed", err);
    process.exit(1);
  }
};
export default DB_CONNECT;

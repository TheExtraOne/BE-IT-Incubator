import mongoose from "mongoose";
import { SETTINGS } from "../common/settings";

export const connectToDb = async (url: string): Promise<boolean> => {
  try {
    await mongoose.connect(url, { dbName: SETTINGS.DB_NAME });
    console.log("Successful connected to db");
    return true;
  } catch (e) {
    console.log(`Can not connect to db. ${e}`);
    await mongoose.disconnect();
    return false;
  }
};

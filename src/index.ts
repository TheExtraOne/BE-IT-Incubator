import app from "./app";
import { connectToDb } from "./repository/db";
import { SETTINGS } from "./settings";

const startApp = async () => {
  await connectToDb(SETTINGS.MONGO_URL);
  app.listen(SETTINGS.PORT, () => {
    console.log("...server started in port " + SETTINGS.PORT);
  });
};

startApp();

import app from "./app";
import { connectToDb } from "./db/db";
import { SETTINGS } from "./settings";

const startApp = async () => {
  const isSuccessful = await connectToDb(SETTINGS.MONGO_URL);
  if (!isSuccessful) process.exit(1);

  app.listen(SETTINGS.PORT, () => {
    console.log("...server started in port " + SETTINGS.PORT);
  });
};

startApp();

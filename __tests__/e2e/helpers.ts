import { agent } from "supertest";
import { SETTINGS } from "../../src/common/settings";
import app from "../../src/app";
import { getEncodedCredentials } from "../../src/common/middlewares/basic-authorization-middleware";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import TBlogControllerInputModel from "../../src/blogs/domain/BlogControllerInputModel";

export const userCredentials = {
  correct: `Basic ${getEncodedCredentials(SETTINGS.ADMIN_CREDENTIALS)}`,
  incorrect: `Basic ${getEncodedCredentials("babyBlossom:sup!r_secure")}`,
};

export const req = agent(app);

export const correctBlogBodyParams: TBlogControllerInputModel = {
  name: "Refactor Guru",
  description: "Best refactoring practice and design patterns",
  websiteUrl: "https://refactoring.guru",
};

export const correctPostBodyParams = {
  title: "Design pattern",
  shortDescription: "Chain of Responsibility",
  content:
    "Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers. Upon receiving a request, each handler decides either to process the request or to pass it to the next handler in the chain.",
};

export const correctUserBodyParams = {
  login: "superAdmin",
  password: "se1cu2re3",
  email: "example@gmail.com",
};

export const incorrectId = "678615a90e0dbf0c27c3e1fa";

let mongoServer: MongoMemoryServer | null = null;

//Test database setup and teardown utilities
export const testDb = {
  setup: async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await testDb.clear();
  },

  clear: async () => {
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  },

  teardown: async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
  },
};

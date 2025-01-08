import { agent } from "supertest";
import { getEncodedCredentials } from "../../src/middleware/authorization-middleware";
import { SETTINGS } from "../../src/settings";
import app from "../../src/app";
import TBlogInputModel from "../../src/controllers/models/BlogInputModel";

export const userCredentials = {
  correct: `Basic ${getEncodedCredentials(SETTINGS.ADMIN_CREDENTIALS)}`,
  incorrect: `Basic ${getEncodedCredentials("babyBlossom:sup!r_secure")}`,
};

export const req = agent(app);

export const correctBodyParams: TBlogInputModel = {
  name: "Refactor Guru",
  description: "Best refactoring practice and design patterns",
  websiteUrl: "https://refactoring.guru",
};

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

export const correctBlogBodyParams: TBlogInputModel = {
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

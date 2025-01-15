import { agent } from "supertest";
import { SETTINGS } from "../../src/settings";
import app from "../../src/app";
import { TBlogControllerInputModel } from "../../src/api/models";
import { getEncodedCredentials } from "../../src/middleware/authorization-middleware";

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
  email: "example@example.com",
};

export const incorrectId = "678615a90e0dbf0c27c3e1fa";

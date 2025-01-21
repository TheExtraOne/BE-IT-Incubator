import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import { client, connectToDb } from "../../../src/db/db";
import { correctUserBodyParams, req } from "../helpers";
import { MongoMemoryServer } from "mongodb-memory-server";
import usersRepository from "../../../src/users/users-repository";

describe("POST /auth/registration-email-resending", () => {
  let server: MongoMemoryServer;
  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    const uri = server.getUri();

    await connectToDb(uri);
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  describe("Email resending success/failure", () => {
    it("should return 204 if email exists and not confirmed", async () => {
      // Create unconfirmed user first
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Try to resend confirmation email
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: correctUserBodyParams.email })
        .expect(HTTP_STATUS.NO_CONTENT_204);
    });

    it("should return 400 if email doesn't exist", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: "nonexistent@gmail.com" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "email",
            message: "Not Found",
          },
        ],
      });
    });

    it("should return 400 if email is already confirmed", async () => {
      // Create user
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Get confirmation code
      const user = await usersRepository.getByLoginOrEmail(
        correctUserBodyParams.login
      );
      const confirmationCode = user!.emailConfirmation.confirmationCode;

      // Confirm email
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Try to resend confirmation
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: correctUserBodyParams.email })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "email",
            message: "Email is already confirmed",
          },
        ],
      });
    });
  });

  describe("Input validation", () => {
    it("should return 400 if email is not provided", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({})
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "email",
            message: "Incorrect type",
          },
        ],
      });
    });

    it("should return 400 if email is empty", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: "" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "email",
            message: "Email is a required field",
          },
        ],
      });
    });

    it("should return 400 if email format is invalid", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-email-resending`)
        .send({ email: "invalid-email" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "email",
            message: "Incorrect email value",
          },
        ],
      });
    });
  });
});

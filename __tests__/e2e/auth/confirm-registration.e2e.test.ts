import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import { client, connectToDb, userCollection } from "../../../src/db/db";
import { correctUserBodyParams, req, userCredentials } from "../helpers";
import { MongoMemoryServer } from "mongodb-memory-server";
import usersRepository from "../../../src/users/users-repository";

describe("POST /auth/registration-confirmation", () => {
  let server: MongoMemoryServer;
  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    const uri = server.getUri();

    await connectToDb(uri);
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  beforeEach(async () => {
    await req
      .post(`${SETTINGS.PATH.AUTH}/registration`)
      .send(correctUserBodyParams)
      .expect(HTTP_STATUS.NO_CONTENT_204);
  });
  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  describe("Registration confirmation success/failure", () => {
    it("should return 204 if confirmation code is valid", async () => {
      // Get the confirmation code from the created user
      const user = await usersRepository.getByLoginOrEmail(
        correctUserBodyParams.login
      );
      const confirmationCode = user!.emailConfirmation.confirmationCode;

      // Confirm registration
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Verify user is confirmed
      const confirmedUser = await usersRepository.getByLoginOrEmail(
        correctUserBodyParams.login
      );
      expect(confirmedUser!.emailConfirmation.isConfirmed).toBe(true);
    });

    it("should return 400 if confirmation code doesn't exist", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: "non-existent-code" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "confirmationCode",
            message: "User with such confirmationCode does not exist",
          },
        ],
      });
    });

    it("should return 400 if confirmation code is already confirmed", async () => {
      const user = await usersRepository.getByLoginOrEmail(
        correctUserBodyParams.login
      );
      const confirmationCode = user!.emailConfirmation.confirmationCode;

      await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Try to confirm again
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "confirmationCode",
            message: "Already confirmed",
          },
        ],
      });
    });

    it("should return 400 if confirmation code is expired", async () => {
      const user = await usersRepository.getByLoginOrEmail(
        correctUserBodyParams.login
      );
      const confirmationCode = user!.emailConfirmation.confirmationCode;

      // Manually expire the confirmation code by setting expiration date to past
      await userCollection.updateOne(
        { _id: user!._id },
        {
          $set: {
            "emailConfirmation.expirationDate": new Date(
              Date.now() - 1000 * 60
            ), // 1 minute ago
          },
        }
      );

      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "confirmationCode",
            message: "Already expired",
          },
        ],
      });
    });
  });

  describe("Input validation", () => {
    it("should return 400 if code is not provided", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({})
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "code",
            message: "Incorrect type",
          },
        ],
      });
    });

    it("should return 400 if code is empty", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: "" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "code",
            message: "Code is a required field",
          },
        ],
      });
    });

    it("should return 400 if code is not string", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration-confirmation`)
        .send({ code: 123 })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "code",
            message: "Incorrect type",
          },
        ],
      });
    });
  });
});

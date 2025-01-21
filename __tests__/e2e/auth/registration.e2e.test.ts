import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import { client, connectToDb } from "../../../src/db/db";
import { correctUserBodyParams, req } from "../helpers";
import { MongoMemoryServer } from "mongodb-memory-server";
import usersRepository from "../../../src/users/users-repository";

describe("POST /auth/registration", () => {
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

  describe("Registration success/failure", () => {
    it("should return 204 and create user if input is valid", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Verify user was created
      const user = await usersRepository.getByLoginOrEmail(
        correctUserBodyParams.login
      );
      expect(user).toBeTruthy();
      expect(user!.accountData.userName).toBe(correctUserBodyParams.login);
      expect(user!.accountData.email).toBe(correctUserBodyParams.email);
      expect(user!.emailConfirmation.isConfirmed).toBe(false);
      expect(user!.emailConfirmation.confirmationCode).toBeTruthy();
    });

    it("should return 400 if login or/and email already exists", async () => {
      // Create first user
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Try to create user with same login
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(response.body).toEqual({
        errorsMessages: [
          {
            field: "login",
            message: "Login already exists",
          },
          {
            field: "email",
            message: "Email already exists",
          },
        ],
      });
    });
  });

  describe("Input validation", () => {
    describe("login validation", () => {
      it("should return 400 if login is not string", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            login: 123,
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "login",
              message: "Incorrect type",
            },
          ],
        });
      });

      it("should return 400 if login is empty", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            login: "",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "login",
              message: "Login is a required field",
            },
          ],
        });
      });

      it("should return 400 if login length is less than 3", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            login: "ab",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "login",
              message: "Incorrect length. Min = 3, max = 10",
            },
          ],
        });
      });

      it("should return 400 if login length is more than 10", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            login: "verylonglogin",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "login",
              message: "Incorrect length. Min = 3, max = 10",
            },
          ],
        });
      });
    });

    describe("password validation", () => {
      it("should return 400 if password is not string", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            password: 123,
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "password",
              message: "Incorrect type",
            },
          ],
        });
      });

      it("should return 400 if password is empty", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            password: "",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "password",
              message: "Password is a required field",
            },
          ],
        });
      });

      it("should return 400 if password length is less than 6", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            password: "12345",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "password",
              message: "Incorrect length. Min = 6, max = 20",
            },
          ],
        });
      });

      it("should return 400 if password length is more than 20", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            password: "123456789012345678901",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "password",
              message: "Incorrect length. Min = 6, max = 20",
            },
          ],
        });
      });
    });

    describe("email validation", () => {
      it("should return 400 if email is not string", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            email: 123,
          })
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
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            email: "",
          })
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
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            ...correctUserBodyParams,
            email: "invalid-email",
          })
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

    describe("Combined validation", () => {
      it("should return 400 and array with all errors if multiple fields are incorrect", async () => {
        const response = await req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send({
            login: "",
            password: "12345",
            email: "invalid-email",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(response.body).toEqual({
          errorsMessages: [
            {
              field: "email",
              message: "Incorrect email value",
            },
            {
              field: "login",
              message: "Login is a required field",
            },
            {
              field: "password",
              message: "Incorrect length. Min = 6, max = 20",
            },
          ],
        });
      });
    });
  });
});
import { emailService } from "../../../src/adapters/email-service";
import {
  HTTP_STATUS,
  RESULT_STATUS,
  SETTINGS,
} from "../../../src/common/settings";
import UsersRepository from "../../../src/features/users/infrastructure/users-repository";
import { correctUserBodyParams, req, testDb } from "../helpers";

import { container } from "../../../src/composition-root";

const usersRepository = container.get<UsersRepository>("UsersRepository");
describe("POST /auth/registration", () => {
  beforeAll(async () => await testDb.setup());

  beforeEach(() => {
    emailService.sendEmail = jest
      .fn()
      .mockImplementation(
        (userEmail: string, subject: string, message: string) =>
          Promise.resolve({
            status: RESULT_STATUS.SUCCESS,
            data: "mailId",
            extensions: [],
          })
      );
  });

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Rate limiting", () => {
    it("should return 429 after exceeding 5 requests within 10 seconds", async () => {
      const makeRequest = () =>
        req
          .post(`${SETTINGS.PATH.AUTH}/registration`)
          .send(correctUserBodyParams);

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const response = await makeRequest();
        expect(response.status).not.toBe(HTTP_STATUS.TOO_MANY_REQUESTS_429);
      }

      // 6th request should return 429
      const response = await makeRequest();
      expect(response.status).toBe(HTTP_STATUS.TOO_MANY_REQUESTS_429);
    }, 8000);
  });

  describe("Registration success/failure", () => {
    it("should return 204 and create user if input is valid", async () => {
      const response = await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(correctUserBodyParams);

      expect(response.status).toBe(HTTP_STATUS.NO_CONTENT_204);

      // Verify user was created
      const user = await usersRepository.getByLoginOrEmail(
        correctUserBodyParams.login
      );
      expect(user).toBeTruthy();
      expect(user!.accountData.userName).toBe(correctUserBodyParams.login);
      expect(user!.accountData.email).toBe(correctUserBodyParams.email);
      expect(user!.emailConfirmation.isConfirmed).toBe(false);
      expect(user!.emailConfirmation.confirmationCode).toBeTruthy();
    }, 8000);

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
    }, 8000);
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
      }, 8000);

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
      }, 8000);

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
      }, 8000);

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
      }, 8000);
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
      }, 8000);

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
      }, 8000);

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
      }, 8000);

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
      }, 8000);
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
      }, 8000);

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
      }, 8000);

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
      }, 8000);
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
      }, 8000);
    });
  });
});

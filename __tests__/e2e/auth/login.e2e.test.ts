import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import {
  correctUserBodyParams,
  req,
  userCredentials,
  testDb,
} from "../helpers";

describe("POST /auth/login", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Login success/failure", () => {
    it("should return 200 if credentials are correct and email is confirmed", async () => {
      // Create user through users endpoint which automatically confirms email
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({ accessToken: expect.any(String) });
    });

    it("should return 400 if email is not confirmed", async () => {
      // Create user through registration endpoint which creates unconfirmed user
      await req
        .post(`${SETTINGS.PATH.AUTH}/registration`)
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const res = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 401 if password is incorrect", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: "wrongPassword",
        })
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 401 if user doesn't exist", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: "nonexistentUser",
          password: "anyPassword",
        })
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });
  });

  describe("Rate limiting", () => {
    it("should return 429 after exceeding 5 requests within 10 seconds", async () => {
      // Create user first
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const loginData = {
        loginOrEmail: correctUserBodyParams.login,
        password: correctUserBodyParams.password,
      };

      // Make 5 successful requests
      for (let i = 0; i < 5; i++) {
        await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .send(loginData)
          .expect(HTTP_STATUS.OK_200);
      }

      // 6th request should be rate limited
      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send(loginData)
        .expect(HTTP_STATUS.TOO_MANY_REQUESTS_429);
    });
  });

  describe("Input validation", () => {
    describe("loginOrEmail validation", () => {
      it("should return 400 if loginOrEmail is not string", async () => {
        const { body } = await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .send({
            loginOrEmail: null,
            password: "password123",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(body).toEqual({
          errorsMessages: [
            { field: "loginOrEmail", message: "Incorrect type" },
          ],
        });
      });

      it("should return 400 if loginOrEmail is empty", async () => {
        const { body } = await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .send({
            loginOrEmail: "   ",
            password: "password123",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(body).toEqual({
          errorsMessages: [
            {
              field: "loginOrEmail",
              message: "loginOrEmail is a required field",
            },
          ],
        });
      });
    });

    describe("password validation", () => {
      it("should return 400 if password is not string", async () => {
        const { body } = await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .send({
            loginOrEmail: "user123",
            password: null,
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(body).toEqual({
          errorsMessages: [{ field: "password", message: "Incorrect type" }],
        });
      });

      it("should return 400 if password is empty", async () => {
        const { body } = await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .send({
            loginOrEmail: "user123",
            password: "   ",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(body).toEqual({
          errorsMessages: [
            { field: "password", message: "Password is a required field" },
          ],
        });
      });
    });
  });
});

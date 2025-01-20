import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import { client, connectToDb } from "../../../src/db/db";
import { correctUserBodyParams, req, userCredentials } from "../helpers";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("POST /auth/login", () => {
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

  describe("Login success/failure", () => {
    it("should return 200 if credentials are correct", async () => {
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

    describe("Combined validation", () => {
      it("should return 400 and array with errors if both fields are incorrect", async () => {
        const { body } = await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .send({
            loginOrEmail: null,
            password: "",
          })
          .expect(HTTP_STATUS.BAD_REQUEST_400);

        expect(body).toEqual({
          errorsMessages: [
            { field: "loginOrEmail", message: "Incorrect type" },
            { field: "password", message: "Password is a required field" },
          ],
        });
      });
    });
  });
});

import { SETTINGS, STATUS } from "../../../src/settings";
import { correctUserBodyParams, req, userCredentials } from "../helpers";
import { client, connectToDb } from "../../../src/data-access/db";
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
    it("should return 204 if credentials are correct", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(STATUS.CREATED_201);

      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(STATUS.NO_CONTENT_204);
    });

    it("should return 401 if password is incorrect", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(STATUS.CREATED_201);

      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: "wrongPassword",
        })
        .expect(STATUS.UNAUTHORIZED_401);
    });

    it("should return 401 if user doesn't exist", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: "nonexistentUser",
          password: "anyPassword",
        })
        .expect(STATUS.UNAUTHORIZED_401);
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
          .expect(STATUS.BAD_REQUEST_400);

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
          .expect(STATUS.BAD_REQUEST_400);

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
          .expect(STATUS.BAD_REQUEST_400);

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
          .expect(STATUS.BAD_REQUEST_400);

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
          .expect(STATUS.BAD_REQUEST_400);

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
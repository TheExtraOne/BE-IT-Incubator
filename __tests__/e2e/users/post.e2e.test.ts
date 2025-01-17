import { SETTINGS, STATUS } from "../../../src/settings";
import { correctUserBodyParams, req, userCredentials } from "../helpers";
import { client, connectToDb } from "../../../src/db/db";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("POST /users", () => {
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

  describe("Authorization", () => {
    it("should return 401 if unauthorized", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .send(correctUserBodyParams)
        .expect(STATUS.UNAUTHORIZED_401);
    });

    it("should return 401 if wrong credentials", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.incorrect })
        .send(correctUserBodyParams)
        .expect(STATUS.UNAUTHORIZED_401);
    });
  });

  describe("Input validation", () => {
    it("should return 400 if login is empty", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, login: "" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Login is a required field",
          field: "login",
        },
      ]);
    });

    it("should return 400 if login is less than 3 characters", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, login: "ab" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Incorrect length. Min = 3, max = 10",
          field: "login",
        },
      ]);
    });

    it("should return 400 if login is more than 10 characters", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, login: "abcdefghijk" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Incorrect length. Min = 3, max = 10",
          field: "login",
        },
      ]);
    });

    it("should return 400 if email is empty", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, email: "" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Email is a required field",
          field: "email",
        },
      ]);
    });

    it("should return 400 if email is invalid", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, email: "invalid-email" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Incorrect email value",
          field: "email",
        },
      ]);
    });

    it("should return 400 if password is empty", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, password: "" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Password is a required field",
          field: "password",
        },
      ]);
    });

    it("should return 400 if password is less than 6 characters", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, password: "12345" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Incorrect length. Min = 6, max = 20",
          field: "password",
        },
      ]);
    });

    it("should return 400 if password is more than 20 characters", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctUserBodyParams, password: "123456789012345678901" })
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Incorrect length. Min = 6, max = 20",
          field: "password",
        },
      ]);
    });
  });

  describe("Success case", () => {
    it("should create user with correct input data", async () => {
      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(STATUS.CREATED_201);

      expect(res.body).toEqual({
        id: expect.any(String),
        login: correctUserBodyParams.login,
        email: correctUserBodyParams.email,
        createdAt: expect.any(String),
      });

      const getRes = await req
        .get(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .expect(STATUS.OK_200);

      expect(getRes.body.items).toEqual([
        {
          id: expect.any(String),
          login: correctUserBodyParams.login,
          email: correctUserBodyParams.email,
          createdAt: expect.any(String),
        },
      ]);
    });

    it("should return 400 if user with the same login and/or email already exists", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(STATUS.CREATED_201);

      const res = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Login already exists",
          field: "login",
        },
        {
          field: "email",
          message: "Email already exists",
        },
      ]);
    });
  });
});

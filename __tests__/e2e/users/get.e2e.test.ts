import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctUserBodyParams,
  req,
  testDb,
  userCredentials,
} from "../helpers";

describe("GET /users", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Users retrieval", () => {
    it("should return 401 if unauthorized", async () => {
      await req.get(SETTINGS.PATH.USERS).expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 200 and an empty array of items if the db is empty", async () => {
      const res = await req
        .get(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
      });
    });

    it("should return 200 and an array with users if the db is not empty", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([
        {
          id: expect.any(String),
          login: correctUserBodyParams.login,
          email: correctUserBodyParams.email,
          createdAt: expect.any(String),
        },
      ]);
    });
  });

  describe("Pagination", () => {
    it("should return correct number of items, page, pageSize, pageCount, totalCount", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({
          ...correctUserBodyParams,
          login: "admin2",
          email: "test2@test.com",
        })
        .expect(HTTP_STATUS.CREATED_201);
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send({
          ...correctUserBodyParams,
          login: "admin3",
          email: "test3@test.com",
        })
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.USERS}?pageNumber=2&pageSize=2`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.OK_200);

      // will be the first because of default sorting based on createdAt field
      expect(res.body).toEqual({
        items: [
          {
            id: expect.any(String),
            login: "superAdmin",
            email: "example@gmail.com",
            createdAt: expect.any(String),
          },
        ],
        page: 2,
        pageSize: 2,
        pagesCount: 2,
        totalCount: 3,
      });
    });
  });

  describe("Filtration", () => {
    it("should return 200 and an array with users that are matching passed login query param", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.USERS}?searchLoginTerm=super`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([
        {
          id: expect.any(String),
          login: correctUserBodyParams.login,
          email: correctUserBodyParams.email,
          createdAt: expect.any(String),
        },
      ]);
    });

    it("should return 200 and an array with users that are matching passed email query param", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.USERS}?searchEmailTerm=example`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([
        {
          id: expect.any(String),
          login: correctUserBodyParams.login,
          email: correctUserBodyParams.email,
          createdAt: expect.any(String),
        },
      ]);
    });

    it("should return an empty array if users login is not matching passed query param", async () => {
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.USERS}?searchLoginTerm=notexist`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([]);
    });
  });

  describe("Query parameters validation", () => {
    it("should return 400 when pageNumber is not an integer", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?pageNumber=1.5`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Should be an integer",
          field: "pageNumber",
        },
      ]);
    });

    it("should return 400 when pageNumber is less than 1", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?pageNumber=0`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Minimum allowed value is 1",
          field: "pageNumber",
        },
      ]);
    });

    it("should return 400 when pageSize is not an integer", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?pageSize=1.5`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Should be an integer",
          field: "pageSize",
        },
      ]);
    });

    it("should return 400 when pageSize is less than 1", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?pageSize=0`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Minimum allowed value is 1",
          field: "pageSize",
        },
      ]);
    });

    it("should return 400 when sortBy is empty", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?sortBy=`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Can't be an empty string",
          field: "sortBy",
        },
      ]);
    });

    it("should return 400 when searchLoginTerm is empty", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?searchLoginTerm=`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Can't be an empty string",
          field: "searchLoginTerm",
        },
      ]);
    });

    it("should return 400 when searchEmailTerm is empty", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?searchEmailTerm=`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Can't be an empty string",
          field: "searchEmailTerm",
        },
      ]);
    });

    it("should return 400 when sortDirection has invalid value", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.USERS}?sortDirection=invalid`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Should be 'asc' or 'desc'",
          field: "sortDirection",
        },
      ]);
    });
  });
});

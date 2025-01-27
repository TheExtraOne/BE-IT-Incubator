import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctBlogBodyParams,
  incorrectId,
  req,
  testDb,
  userCredentials,
} from "../helpers";

describe("GET /blogs", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Blogs retrieval", () => {
    it("should return 200 and an empty array of items if the db is empty", async () => {
      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
      });
    });

    it("should return 200 and an array with blogs if the db is not empty", async () => {
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([
        {
          ...correctBlogBodyParams,
          createdAt: expect.any(String),
          id: expect.any(String),
          isMembership: false,
        },
      ]);
    });

    it("should return 404 in case if id was passed, but the db is empty", async () => {
      await req
        .get(`${SETTINGS.PATH.BLOGS}/678619d10375b7522f04da0e`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 404 in case if id is not matching the db", async () => {
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .get(`${SETTINGS.PATH.BLOGS}/${incorrectId}`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 200 and blog (with id, name, description, websiteUrl,createdAt and isMembership) in case if id is matching the db", async () => {
      const {
        body: { id },
      } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const { body } = await req
        .get(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(body).toEqual({
        ...correctBlogBodyParams,
        createdAt: expect.any(String),
        id: expect.any(String),
        isMembership: false,
      });
    });
  });

  describe("Pagination", () => {
    it("should return correct number of items, page, pageSize, pageCount, totalCount", async () => {
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}?pageNumber=2&pageSize=2`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [
          {
            ...correctBlogBodyParams,
            createdAt: expect.any(String),
            id: expect.any(String),
            isMembership: false,
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
    it("should return 200 and an array with blogs that are matching passed query param", async () => {
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}?searchNameTerm=ru`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([
        {
          ...correctBlogBodyParams,
          createdAt: expect.any(String),
          id: expect.any(String),
          isMembership: false,
        },
      ]);
    });

    it("should return an empty array if blogs name is not matching passed query param", async () => {
      await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}?searchNameTerm=doka`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([]);
    });
  });

  describe("Query parameters validation", () => {
    it("should return 400 when pageNumber is not an integer", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}?pageNumber=1.5`)
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
        .get(`${SETTINGS.PATH.BLOGS}?pageNumber=0`)
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
        .get(`${SETTINGS.PATH.BLOGS}?pageSize=1.5`)
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
        .get(`${SETTINGS.PATH.BLOGS}?pageSize=0`)
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
        .get(`${SETTINGS.PATH.BLOGS}?sortBy=`)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Can't be an empty string",
          field: "sortBy",
        },
      ]);
    });

    it("should return 400 when searchNameTerm is empty", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}?searchNameTerm=`)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Can't be an empty string",
          field: "searchNameTerm",
        },
      ]);
    });

    it("should return 400 when sortDirection has invalid value", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}?sortDirection=invalid`)
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

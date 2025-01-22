import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  incorrectId,
  req,
  testDb,
  userCredentials,
} from "../helpers";

describe("GET /posts", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Posts retrieval", () => {
    it("should return 200 and an empty array of items if the db is empty", async () => {
      const res = await req.get(SETTINGS.PATH.POSTS).expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
      });
    });

    it("should return 200 and an array with posts if the db is not empty", async () => {
      const {
        body: { id: blogId, name: blogName },
      } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const {
        body: { id },
      } = await req
        .post(SETTINGS.PATH.POSTS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctPostBodyParams, blogId })
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req.get(SETTINGS.PATH.POSTS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items).toEqual([
        {
          ...correctPostBodyParams,
          blogId,
          blogName,
          id,
          createdAt: expect.any(String),
        },
      ]);
    });
    it("should return 404 in case if id was passed, but the db is empty", async () => {
      await req
        .get(`${SETTINGS.PATH.POSTS}/678619d10375b7522f04da0e`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 404 in case if id is not matching the db", async () => {
      const {
        body: { id: blogId, name: blogName },
      } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .post(SETTINGS.PATH.POSTS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctPostBodyParams, blogId })
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .get(`${SETTINGS.PATH.POSTS}/${incorrectId}`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 200 and a post (with id, title, shortDescription, content, blogId, createdAt and blogName) in case if id is matching the db", async () => {
      const {
        body: { id: blogId, name: blogName },
      } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const {
        body: { id },
      } = await req
        .post(SETTINGS.PATH.POSTS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctPostBodyParams, blogId })
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        ...correctPostBodyParams,
        blogId,
        blogName,
        id,
        createdAt: expect.any(String),
      });
    });
  });
  describe("Pagination", () => {
    it("should return 200 and correct number of items, page, pageSize, pageCount and totalCount", async () => {
      const {
        body: { id: blogId, name: blogName },
      } = await req
        .post(SETTINGS.PATH.BLOGS)
        .set({ Authorization: userCredentials.correct })
        .send(correctBlogBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .post(SETTINGS.PATH.POSTS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctPostBodyParams, blogId })
        .expect(HTTP_STATUS.CREATED_201);
      const {
        body: { id },
      } = await req
        .post(SETTINGS.PATH.POSTS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctPostBodyParams, blogId })
        .expect(HTTP_STATUS.CREATED_201);
      await req
        .post(SETTINGS.PATH.POSTS)
        .set({ Authorization: userCredentials.correct })
        .send({ ...correctPostBodyParams, blogId })
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}?pageNumber=2&pageSize=1`)
        .expect(HTTP_STATUS.OK_200);
      expect(res.body).toEqual({
        items: [
          {
            ...correctPostBodyParams,
            blogId,
            blogName,
            id,
            createdAt: expect.any(String),
          },
        ],
        page: 2,
        pageSize: 1,
        pagesCount: 3,
        totalCount: 3,
      });
    });
  });

  describe("Query parameters validation", () => {
    it("should return 400 when pageNumber is not an integer", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.POSTS}?pageNumber=1.5`)
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
        .get(`${SETTINGS.PATH.POSTS}?pageNumber=0`)
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
        .get(`${SETTINGS.PATH.POSTS}?pageSize=1.5`)
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
        .get(`${SETTINGS.PATH.POSTS}?pageSize=0`)
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
        .get(`${SETTINGS.PATH.POSTS}?sortBy=`)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Can't be an empty string",
          field: "sortBy",
        },
      ]);
    });

    it("should return 400 when sortDirection has invalid value", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.POSTS}?sortDirection=invalid`)
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

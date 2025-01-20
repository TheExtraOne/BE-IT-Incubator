import { client, connectToDb } from "../../../src/db/db";
import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  incorrectId,
  req,
  userCredentials,
} from "../helpers";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("GET /blogs/:id/posts", () => {
  let server: MongoMemoryServer;
  let blogId: string;

  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    const uri = server.getUri();

    await connectToDb(uri);
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  beforeEach(async () => {
    const response = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(HTTP_STATUS.CREATED_201);

    blogId = response.body.id;
  });

  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  describe("Query parameters validation", () => {
    it("should return 400 when pageNumber is not an integer", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts?pageNumber=1.5`)
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
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts?pageNumber=0`)
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
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts?pageSize=1.5`)
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
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts?pageSize=0`)
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
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts?sortBy=`)
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
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts?sortDirection=invalid`)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Should be 'asc' or 'desc'",
          field: "sortDirection",
        },
      ]);
    });
  });

  describe("Blog posts retrieval", () => {
    it("should return 404 if blog id does not exist", async () => {
      await req
        .get(`${SETTINGS.PATH.BLOGS}/${incorrectId}/posts`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 200 and empty array if blog has no posts", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
      });
    });

    it("should return 200 and array of posts if blog has posts", async () => {
      // Create a post for the blog
      await req
        .post(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
        .set({ Authorization: userCredentials.correct })
        .send(correctPostBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toEqual({
        ...correctPostBodyParams,
        blogId,
        blogName: correctBlogBodyParams.name,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("should return correct pagination results", async () => {
      // Create 3 posts for the blog
      await req
        .post(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
        .set({ Authorization: userCredentials.correct })
        .send(correctPostBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .post(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
        .set({ Authorization: userCredentials.correct })
        .send(correctPostBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .post(`${SETTINGS.PATH.BLOGS}/${blogId}/posts`)
        .set({ Authorization: userCredentials.correct })
        .send(correctPostBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.BLOGS}/${blogId}/posts?pageNumber=2&pageSize=2`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [
          {
            ...correctPostBodyParams,
            blogId,
            blogName: correctBlogBodyParams.name,
            id: expect.any(String),
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
});

import { client, connectToDb } from "../../../src/db/db";
import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  correctUserBodyParams,
  incorrectId,
  req,
  userCredentials,
} from "../helpers";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("GET /posts/:id/comments", () => {
  let server: MongoMemoryServer;
  let postId: string;
  let accessToken: string;

  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    const uri = server.getUri();

    await connectToDb(uri);
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  beforeEach(async () => {
    // Create a user and get access token
    await req
      .post(SETTINGS.PATH.USERS)
      .set({ Authorization: userCredentials.correct })
      .send(correctUserBodyParams)
      .expect(HTTP_STATUS.CREATED_201);

    const {
      body: { accessToken: token },
    } = await req
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({
        loginOrEmail: correctUserBodyParams.login,
        password: correctUserBodyParams.password,
      })
      .expect(HTTP_STATUS.OK_200);

    accessToken = token;

    // Create a blog
    const {
      body: { id: blogId },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(HTTP_STATUS.CREATED_201);

    // Create a post
    const {
      body: { id },
    } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(HTTP_STATUS.CREATED_201);

    postId = id;
  });

  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  describe("Query parameters validation", () => {
    it("should return 400 when pageNumber is not an integer", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments?pageNumber=1.5`)
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
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments?pageNumber=0`)
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
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments?pageSize=1.5`)
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
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments?pageSize=0`)
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
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments?sortBy=`)
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
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments?sortDirection=invalid`)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body.errorsMessages).toEqual([
        {
          message: "Should be 'asc' or 'desc'",
          field: "sortDirection",
        },
      ]);
    });
  });

  describe("Post comments retrieval", () => {
    it("should return 404 if post id does not exist", async () => {
      await req
        .get(`${SETTINGS.PATH.POSTS}/${incorrectId}/comments`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 200 and empty array if post has no comments", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
      });
    });

    it("should return 200 and array of comments if post has comments", async () => {
      // Create a comment for the post
      await req
        .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: "Test comment content" })
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        content: "Test comment content",
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        createdAt: expect.any(String),
      });
    });

    it("should return correct pagination results", async () => {
      // Create 3 comments for the post
      await req
        .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: "Test comment content 1" })
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: "Test comment content 2" })
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: "Test comment content 3" })
        .expect(HTTP_STATUS.CREATED_201);

      const res = await req
        .get(
          `${SETTINGS.PATH.POSTS}/${postId}/comments?pageNumber=2&pageSize=2`
        )
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        items: [
          {
            id: expect.any(String),
            content: expect.any(String),
            commentatorInfo: {
              userId: expect.any(String),
              userLogin: expect.any(String),
            },
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

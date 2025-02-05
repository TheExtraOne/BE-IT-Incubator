import {
  correctBlogBodyParams,
  correctPostBodyParams,
  incorrectId,
  req,
  testDb,
  userCredentials,
} from "../helpers";
import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";

describe("PUT /posts", () => {
  let id: string;
  let blogName: string;
  let unchangedResponse: Record<string, string | Record<string, string | []>>;
  let newBodyParams: Record<string, string>;

  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  beforeEach(async () => {
    const {
      body: { id: blogId, name },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams);

    const {
      body: { id: postId },
    } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId });

    id = postId;
    blogName = name;

    unchangedResponse = {
      ...correctPostBodyParams,
      id,
      blogId,
      blogName,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: expect.any(Number),
        likesCount: expect.any(Number),
        myStatus: "None",
        newestLikes: [],
      },
    };

    newBodyParams = {
      title: "New title",
      shortDescription: "New description",
      content: "New content",
      blogId,
    };
  });

  describe("Authorization", () => {
    it("should return 401 if user is not authorized (authorized no headers)", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .send(newBodyParams)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 401 if login or password is incorrect", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.incorrect })
        .send(newBodyParams)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });
  });

  describe("Updating", () => {
    // Id matching
    it("should return 404 in case if id is not matching the db", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${incorrectId}`)
        .set({ Authorization: userCredentials.correct })
        .send(newBodyParams)
        .expect(HTTP_STATUS.NOT_FOUND_404);

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });
    // Success
    it("should return 201 with new post if login, password and body params are correct. New post should contain id, title, shortDescription, content, blogId, createdAt and blogName", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(newBodyParams)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        ...newBodyParams,
        id,
        blogName,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          dislikesCount: expect.any(Number),
          likesCount: expect.any(Number),
          myStatus: "None",
          newestLikes: [],
        },
      });
    });
  });

  describe("Validation", () => {
    // Title validation
    it("should return 400 and error if title is not string", async () => {
      const bodyParams = { ...newBodyParams, title: null };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "title", message: "Incorrect type" }],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if title is empty string", async () => {
      const bodyParams = { ...newBodyParams, title: "" };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "title", message: "Title is a required field" },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if title is too long", async () => {
      const bodyParams = {
        ...newBodyParams,
        title: "Title".repeat(100),
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "title", message: "Incorrect length. Min = 1, max = 15" },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    // ShortDescription validation
    it("should return 400 and error if shortDescription is not string", async () => {
      const bodyParams = {
        ...newBodyParams,
        shortDescription: null,
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          { field: "shortDescription", message: "Incorrect type" },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if shortDescription is empty string", async () => {
      const bodyParams = {
        ...newBodyParams,
        shortDescription: "    ",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "shortDescription",
            message: "ShortDescription is a required field",
          },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if shortDescription is too long", async () => {
      const bodyParams = {
        ...newBodyParams,
        shortDescription: "Design pattern".repeat(100),
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "shortDescription",
            message: "Incorrect length. Min = 1, max = 100",
          },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    // Content validation
    it("should return 400 and error if content is not string", async () => {
      const bodyParams = {
        ...newBodyParams,
        content: [],
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "content", message: "Incorrect type" }],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if content is empty string", async () => {
      const bodyParams = {
        ...newBodyParams,
        content: "",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "content",
            message: "Content is a required field",
          },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if content is too long", async () => {
      const bodyParams = {
        ...newBodyParams,
        content:
          "Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers.".repeat(
            100
          ),
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "content",
            message: "Incorrect length. Min = 1, max = 1000",
          },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    // BlogId validation
    it("should return 400 and error if blogId is not string", async () => {
      const bodyParams = {
        ...newBodyParams,
        blogId: 1234,
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [{ field: "blogId", message: "Incorrect type" }],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if blogId is empty string", async () => {
      const bodyParams = {
        ...newBodyParams,
        blogId: "    ",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "blogId",
            message: "Incorrect type",
          },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    it("should return 400 and error if blogId does not match the db", async () => {
      const bodyParams = {
        ...newBodyParams,
        blogId: incorrectId,
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "blogId",
            message: "BlogId does not exist",
          },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });

    // Combined validation
    it("should return 400 and array with errors if couple of fields are incorrect", async () => {
      const bodyParams = {
        ...newBodyParams,
        blogId: incorrectId,
        content: "",
      };

      const { body } = await req
        .put(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .send(bodyParams)
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(body).toEqual({
        errorsMessages: [
          {
            field: "content",
            message: "Content is a required field",
          },
          {
            field: "blogId",
            message: "BlogId does not exist",
          },
        ],
      });

      const res = await req
        .get(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual(unchangedResponse);
    });
  });
});

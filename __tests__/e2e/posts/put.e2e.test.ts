import app from "../../../src/app";
import { agent } from "supertest";
import {
  resetBlogsDB,
  resetPostsDB,
} from "../../../src/db-in-memory/db-in-memory";
import { SETTINGS, STATUS } from "../../../src/settings";
import { mockBlogs, mockPosts, userCredentials } from "../helpers";
import TPostInputModel from "../../../src/models/PostInputModel";

const req = agent(app);
const correctBlogBodyParams: TPostInputModel = {
  title: "Chain",
  shortDescription: "Design pattern",
  content:
    "Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers.",
  blogId: mockBlogs[0].id,
};

describe("PUT /posts", () => {
  beforeEach(async () => {
    resetBlogsDB(mockBlogs);
    resetPostsDB(mockPosts);
  });

  // Authorization
  it("should return 401 if user is not authorized (authorized no headers)", async () => {
    await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .send(correctBlogBodyParams)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 401 if login or password is incorrect", async () => {
    await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.incorrect })
      .send(correctBlogBodyParams)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  // Id matching
  it("should return 404 in case if id is not matching the db", async () => {
    await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts.length + 1}`)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.NOT_FOUND_404);

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockBlogs[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  // Title validation
  it("should return 400 and error if title is not string", async () => {
    const bodyParams = { ...correctBlogBodyParams, title: null };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "title", message: "Incorrect type" }],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if title is empty string", async () => {
    const bodyParams = { ...correctBlogBodyParams, title: "" };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "title", message: "Title is a required field" },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if title is too long", async () => {
    const bodyParams = { ...correctBlogBodyParams, title: "Title".repeat(100) };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "title", message: "Incorrect length. Min = 1, max = 15" },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  // ShortDescription validation
  it("should return 400 and error if shortDescription is not string", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      shortDescription: null,
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "shortDescription", message: "Incorrect type" },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if shortDescription is empty string", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      shortDescription: "    ",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "shortDescription",
          message: "ShortDescription is a required field",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if shortDescription is too long", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      shortDescription: "Design pattern".repeat(100),
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "shortDescription",
          message: "Incorrect length. Min = 1, max = 100",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  // Content validation
  it("should return 400 and error if content is not string", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      content: [],
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "content", message: "Incorrect type" }],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if content is empty string", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      content: "",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "content",
          message: "Content is a required field",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if content is too long", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      content:
        "Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers.".repeat(
          100
        ),
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "content",
          message: "Incorrect length. Min = 1, max = 1000",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  // BlogId validation
  it("should return 400 and error if blogId is not string", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      blogId: 1234,
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "blogId", message: "Incorrect type" }],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if blogId is empty string", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      blogId: "    ",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "blogId",
          message: "BlogId is a required field",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  it("should return 400 and error if blogId does not match the db", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      blogId: "BlogId",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        {
          field: "blogId",
          message: "BlogId does not exist",
        },
      ],
    });

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  // Combined validation
  it("should return 400 and array with errors if couple of fields are incorrect", async () => {
    const bodyParams = {
      ...correctBlogBodyParams,
      blogId: "BlogId",
      content: "",
    };

    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

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
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).not.toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
    });
  });

  // Success
  it("should return 201 with new post if login, password and body params are correct. New post should contain id, title, shortDescription, content, blogId and blogName", async () => {
    const { body } = await req
      .put(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.NO_CONTENT_204);

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${mockPosts[0].id}`)
      .expect(STATUS.OK_200);
    expect(res.body).toEqual({
      ...correctBlogBodyParams,
      id: expect.any(String),
      blogName: mockPosts[0].blogName,
    });
  });
});

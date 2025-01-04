import app from "../../../src/app";
import { agent } from "supertest";
import { resetBlogsDB, resetPostsDB } from "../../../src/db/db";
import { SETTINGS, STATUS } from "../../../src/settings";
import { mockBlogs, userCredentials } from "../helpers";
import TPostInputModel from "../../../src/models/PostInputModel";

const req = agent(app);
const correctBodyParams: TPostInputModel = {
  title: "Chain",
  shortDescription: "Design pattern",
  content:
    "Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers.",
  blogId: mockBlogs[0].id,
};

describe("POST /posts", () => {
  beforeEach(async () => resetPostsDB());

  // Authorization
  it("should return 401 if user is not authorized (authorized no headers)", async () => {
    await req
      .post(SETTINGS.PATH.POSTS)
      .send(correctBodyParams)
      .expect(STATUS.UNAUTHORIZED_401);
  });

  it("should return 401 if login or password is incorrect", async () => {
    await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.incorrect })
      .send(correctBodyParams)
      .expect(STATUS.UNAUTHORIZED_401);
  });

  // Success
  it("should return 201 with new post if login, password and body params are correct. New post should contain id, title, shortDescription, content, blogId and blogName", async () => {
    resetBlogsDB(mockBlogs);

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBodyParams)
      .expect(STATUS.CREATED_201);

    expect(body).toEqual({
      ...correctBodyParams,
      id: expect.any(String),
      blogName: mockBlogs[0].name,
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(1);
  });

  // Title validation
  it("should return 400 and error if title is not string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = { ...correctBodyParams, title: null };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "title", message: "Incorrect type" }],
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if title is empty string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = { ...correctBodyParams, title: "" };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "title", message: "Title is a required field" },
      ],
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if title is too long", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = { ...correctBodyParams, title: "Title".repeat(100) };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "title", message: "Incorrect length. Min = 1, max = 15" },
      ],
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  // ShortDescription validation
  it("should return 400 and error if shortDescription is not string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      shortDescription: null,
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [
        { field: "shortDescription", message: "Incorrect type" },
      ],
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if shortDescription is empty string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      shortDescription: "    ",
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
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

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if shortDescription is too long", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      shortDescription: "Design pattern".repeat(100),
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
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

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  // Content validation
  it("should return 400 and error if content is not string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      content: [],
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "content", message: "Incorrect type" }],
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if content is empty string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      content: "",
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
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

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if content is too long", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      content:
        "Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers.".repeat(
          100
        ),
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
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

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  // BlogId validation
  it("should return 400 and error if blogId is not string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      blogId: 1234,
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send(bodyParams)
      .expect(STATUS.BAD_REQUEST_400);

    expect(body).toEqual({
      errorsMessages: [{ field: "blogId", message: "Incorrect type" }],
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if blogId is empty string", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      blogId: "    ",
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
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

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  it("should return 400 and error if blogId does not match the db", async () => {
    resetBlogsDB(mockBlogs);

    const bodyParams = {
      ...correctBodyParams,
      blogId: "BlogId",
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
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

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });

  // Combined validation
  it("should return 400 and array with errors if couple of fields are incorrect", async () => {
    const bodyParams = {
      ...correctBodyParams,
      blogId: "BlogId",
      content: "",
    };

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
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

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });
});

import { SETTINGS, STATUS } from "../../../src/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  req,
  userCredentials,
} from "../helpers";
import { client, connectToDb } from "../../../src/repository/db";

describe("POST /posts", () => {
  beforeAll(async () => {
    await connectToDb();
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => await client.close());

  // Authorization
  it("should return 401 if user is not authorized (authorized no headers)", async () => {
    const {
      body: { id: blogId },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    await req
      .post(SETTINGS.PATH.POSTS)
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.UNAUTHORIZED_401);
  });

  it("should return 401 if login or password is incorrect", async () => {
    const {
      body: { id: blogId },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.incorrect })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.UNAUTHORIZED_401);
  });

  // Success
  it("should return 201 with new post if login, password and body params are correct. New post should contain id, title, shortDescription, content, blogId, createdAt and blogName", async () => {
    const {
      body: { id: blogId, name: blogName },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    const { body } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);

    expect(body).toEqual({
      ...correctPostBodyParams,
      id: body.id,
      blogId,
      blogName,
      createdAt: expect.any(String),
    });

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(1);
  });

  // // Title validation
  // it("should return 400 and error if title is not string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = { ...correctBlogBodyParams, title: null };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [{ field: "title", message: "Incorrect type" }],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if title is empty string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = { ...correctBlogBodyParams, title: "" };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       { field: "title", message: "Title is a required field" },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if title is too long", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = { ...correctBlogBodyParams, title: "Title".repeat(100) };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       { field: "title", message: "Incorrect length. Min = 1, max = 15" },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // // ShortDescription validation
  // it("should return 400 and error if shortDescription is not string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     shortDescription: null,
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       { field: "shortDescription", message: "Incorrect type" },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if shortDescription is empty string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     shortDescription: "    ",
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: "shortDescription",
  //         message: "ShortDescription is a required field",
  //       },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if shortDescription is too long", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     shortDescription: "Design pattern".repeat(100),
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: "shortDescription",
  //         message: "Incorrect length. Min = 1, max = 100",
  //       },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // // Content validation
  // it("should return 400 and error if content is not string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     content: [],
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [{ field: "content", message: "Incorrect type" }],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if content is empty string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     content: "",
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: "content",
  //         message: "Content is a required field",
  //       },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if content is too long", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     content:
  //       "Chain of Responsibility is a behavioral design pattern that lets you pass requests along a chain of handlers.".repeat(
  //         100
  //       ),
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: "content",
  //         message: "Incorrect length. Min = 1, max = 1000",
  //       },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // // BlogId validation
  // it("should return 400 and error if blogId is not string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     blogId: 1234,
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [{ field: "blogId", message: "Incorrect type" }],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if blogId is empty string", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     blogId: "    ",
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: "blogId",
  //         message: "BlogId is a required field",
  //       },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // it("should return 400 and error if blogId does not match the db", async () => {
  //   resetBlogsDB(mockBlogs);

  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     blogId: "BlogId",
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: "blogId",
  //         message: "BlogId does not exist",
  //       },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });

  // // Combined validation
  // it("should return 400 and array with errors if couple of fields are incorrect", async () => {
  //   const bodyParams = {
  //     ...correctBlogBodyParams,
  //     blogId: "BlogId",
  //     content: "",
  //   };

  //   const { body } = await req
  //     .post(SETTINGS.PATH.POSTS)
  //     .set({ Authorization: userCredentials.correct })
  //     .send(bodyParams)
  //     .expect(STATUS.BAD_REQUEST_400);

  //   expect(body).toEqual({
  //     errorsMessages: [
  //       {
  //         field: "content",
  //         message: "Content is a required field",
  //       },
  //       {
  //         field: "blogId",
  //         message: "BlogId does not exist",
  //       },
  //     ],
  //   });

  //   const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
  //   expect(res.body.length).toEqual(0);
  // });
});

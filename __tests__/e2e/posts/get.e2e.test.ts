import { client, connectToDb } from "../../../src/repository/db";
import { SETTINGS, STATUS } from "../../../src/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  req,
  userCredentials,
} from "../helpers";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("GET /posts", () => {
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

  it("should return 200 and an empty array of items if the db is empty", async () => {
    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);

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
      .expect(STATUS.CREATED_201);

    const {
      body: { id },
    } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
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

  it("should return 200 and correct number of items, page, pageSize, pageCount and totalCount", async () => {
    const {
      body: { id: blogId, name: blogName },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);
    const {
      body: { id },
    } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);
    await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}?pageNumber=2&pageSize=1`)
      .expect(STATUS.OK_200);
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

  it("should return 404 in case if id was passed, but the db is empty", async () => {
    await req.get(`${SETTINGS.PATH.POSTS}/1`).expect(STATUS.NOT_FOUND_404);
  });

  it("should return 404 in case if id is not matching the db", async () => {
    const {
      body: { id: blogId, name: blogName },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);

    await req.get(`${SETTINGS.PATH.POSTS}/-1`).expect(STATUS.NOT_FOUND_404);
  });

  it("should return 200 and a post (with id, title, shortDescription, content, blogId, createdAt and blogName) in case if id is matching the db", async () => {
    const {
      body: { id: blogId, name: blogName },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    const {
      body: { id },
    } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);

    const res = await req
      .get(`${SETTINGS.PATH.POSTS}/${id}`)
      .expect(STATUS.OK_200);

    expect(res.body).toEqual({
      ...correctPostBodyParams,
      blogId,
      blogName,
      id,
      createdAt: expect.any(String),
    });
  });

  // Query parameters validation
  it("should return 400 when pageNumber is not an integer", async () => {
    const res = await req
      .get(`${SETTINGS.PATH.POSTS}?pageNumber=1.5`)
      .expect(STATUS.BAD_REQUEST_400);

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
      .expect(STATUS.BAD_REQUEST_400);

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
      .expect(STATUS.BAD_REQUEST_400);

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
      .expect(STATUS.BAD_REQUEST_400);

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
      .expect(STATUS.BAD_REQUEST_400);

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
      .expect(STATUS.BAD_REQUEST_400);

    expect(res.body.errorsMessages).toEqual([
      {
        message: "Should be 'asc' or 'desc'",
        field: "sortDirection",
      },
    ]);
  });
});

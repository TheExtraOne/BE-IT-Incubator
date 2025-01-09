import { client, connectToDb } from "../../../src/repository/db";
import { SETTINGS, STATUS } from "../../../src/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  req,
  userCredentials,
} from "../helpers";

describe("GET /posts", () => {
  beforeAll(async () => {
    await connectToDb();
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => await client.close());

  it("should return 200 and an empty array if the db is empty", async () => {
    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);

    expect(res.body).toEqual([]);
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
    expect(res.body).toEqual([
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
});

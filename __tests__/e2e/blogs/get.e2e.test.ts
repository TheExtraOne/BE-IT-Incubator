import { SETTINGS, STATUS } from "../../../src/settings";
import { correctBlogBodyParams, req, userCredentials } from "../helpers";
import { client, connectToDb } from "../../../src/repository/db";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("GET /blogs", () => {
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

  it("should return 200 and an empty array if the db is empty", async () => {
    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);

    expect(res.body).toEqual([]);
  });

  it("should return 200 and an array with blogs if the db is not empty", async () => {
    await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    const res = await req.get(SETTINGS.PATH.BLOGS).expect(STATUS.OK_200);

    expect(res.body).toEqual([
      {
        ...correctBlogBodyParams,
        createdAt: expect.any(String),
        id: expect.any(String),
        isMembership: false,
      },
    ]);
  });

  it("should return 404 in case if id was passed, but the db is empty", async () => {
    await req.get(`${SETTINGS.PATH.BLOGS}/1`).expect(STATUS.NOT_FOUND_404);
  });

  it("should return 404 in case if id is not matching the db", async () => {
    await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    await req.get(`${SETTINGS.PATH.BLOGS}/-1`).expect(STATUS.NOT_FOUND_404);
  });

  it("should return 200 and blog (with id, name, description, websiteUrl,createdAt and isMembership) in case if id is matching the db", async () => {
    const {
      body: { id },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    const { body } = await req
      .get(`${SETTINGS.PATH.BLOGS}/${id}`)
      .expect(STATUS.OK_200);

    expect(body).toEqual({
      ...correctBlogBodyParams,
      createdAt: expect.any(String),
      id: expect.any(String),
      isMembership: false,
    });
  });
});

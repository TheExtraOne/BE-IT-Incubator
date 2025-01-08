import { client, connectToDb } from "../../../src/repository/db";
import { SETTINGS, STATUS } from "../../../src/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  req,
  userCredentials,
} from "../helpers";

describe("DELETE /posts", () => {
  let id: string;

  beforeAll(async () => {
    await connectToDb();
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  beforeEach(async () => {
    const {
      body: { id: blogId },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(STATUS.CREATED_201);

    const {
      body: { id: postId },
    } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(STATUS.CREATED_201);
    id = postId;
  });

  afterEach(async () => await req.delete(`${SETTINGS.PATH.TESTING}/all-data`));

  afterAll(async () => await client.close());

  // Authorization
  it("should return 401 if user is not authorized (authorized no headers)", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/${id}`)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(1);
  });

  it("should return 401 if login or password is incorrect", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/${id}`)
      .expect(STATUS.UNAUTHORIZED_401);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(1);
  });

  it("should return 404 if id is not matching", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/-1`)
      .set({ Authorization: userCredentials.correct })
      .expect(STATUS.NOT_FOUND_404);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(1);
  });

  it("should return 204 if id is matching", async () => {
    await req
      .delete(`${SETTINGS.PATH.POSTS}/${id}`)
      .set({ Authorization: userCredentials.correct })
      .expect(STATUS.NO_CONTENT_204);

    const res = await req.get(SETTINGS.PATH.POSTS).expect(STATUS.OK_200);
    expect(res.body.length).toEqual(0);
  });
});

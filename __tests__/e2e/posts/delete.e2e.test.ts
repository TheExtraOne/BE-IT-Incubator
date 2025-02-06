import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctBlogBodyParams,
  correctPostBodyParams,
  incorrectId,
  req,
  testDb,
  userCredentials,
} from "../helpers";

describe("DELETE /posts", () => {
  let id: string;

  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  beforeEach(async () => {
    const {
      body: { id: blogId },
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
  });

  describe("Authorization", () => {
    it("should return 401 if user is not authorized (authorized no headers)", async () => {
      await req
        .delete(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req.get(SETTINGS.PATH.POSTS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(1);
    }, 8000);

    it("should return 401 if login or password is incorrect", async () => {
      await req
        .delete(`${SETTINGS.PATH.POSTS}/${id}`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req.get(SETTINGS.PATH.POSTS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(1);
    }, 8000);
  });

  describe("Deleting", () => {
    it("should return 404 if id is not matching", async () => {
      await req
        .delete(`${SETTINGS.PATH.POSTS}/${incorrectId}`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.NOT_FOUND_404);

      const res = await req.get(SETTINGS.PATH.POSTS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(1);
    }, 8000);

    it("should return 204 if id is matching", async () => {
      await req
        .delete(`${SETTINGS.PATH.POSTS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const res = await req.get(SETTINGS.PATH.POSTS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    }, 8000);
  });
});

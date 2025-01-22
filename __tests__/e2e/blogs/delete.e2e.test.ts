import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctBlogBodyParams,
  incorrectId,
  req,
  testDb,
  userCredentials,
} from "../helpers";

describe("DELETE /blogs", () => {
  let id: string;

  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  beforeEach(async () => {
    const { body } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams);

    id = body.id;
  });

  describe("Authorization", () => {
    it("should return 401 if user is not authorized (authorized no headers)", async () => {
      await req
        .delete(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(1);
    });

    it("should return 401 if login or password is incorrect", async () => {
      await req
        .delete(`${SETTINGS.PATH.BLOGS}/${id}`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(1);
    });
  });

  describe("Deleting blog", () => {
    it("should return 404 if id is not matching", async () => {
      await req
        .delete(`${SETTINGS.PATH.BLOGS}/${incorrectId}`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.NOT_FOUND_404);

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(1);
    });

    it("should return 204 if id is matching", async () => {
      await req
        .delete(`${SETTINGS.PATH.BLOGS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const res = await req.get(SETTINGS.PATH.BLOGS).expect(HTTP_STATUS.OK_200);
      expect(res.body.items.length).toEqual(0);
    });
  });
});

import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  correctUserBodyParams,
  incorrectId,
  req,
  testDb,
  userCredentials,
} from "../helpers";

describe("DELETE /users/:id", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Authorization", () => {
    it("should return 401 if unauthorized", async () => {
      await req
        .delete(`${SETTINGS.PATH.USERS}/${incorrectId}`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    }, 8000);

    it("should return 401 if wrong credentials", async () => {
      await req
        .delete(`${SETTINGS.PATH.USERS}/${incorrectId}`)
        .set({ Authorization: userCredentials.incorrect })
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    }, 8000);
  });

  describe("Error cases", () => {
    it("should return 404 if user doesn't exist", async () => {
      await req
        .delete(`${SETTINGS.PATH.USERS}/${incorrectId}`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.NOT_FOUND_404);
    }, 8000);
  });

  describe("Success case", () => {
    it("should delete existing user", async () => {
      const {
        body: { id },
      } = await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      await req
        .delete(`${SETTINGS.PATH.USERS}/${id}`)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const res = await req
        .get(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.items).toEqual([]);
    }, 8000);
  });
});

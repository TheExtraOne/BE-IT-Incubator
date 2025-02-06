import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import {
  correctUserBodyParams,
  req,
  userCredentials,
  testDb,
} from "../helpers";

describe("POST /auth/logout", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Logout success/failure", () => {
    it("should return 204 and clear cookie if refresh token is valid", async () => {
      // Create user, used endpoint without necessary mail confirmation
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      // Login to get tokens
      const loginRes = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.OK_200);

      // Get refresh token from cookies
      const cookies = loginRes.headers["set-cookie"];
      const refreshTokenCookie = cookies[0];

      // Logout
      const logoutRes = await req
        .post(`${SETTINGS.PATH.AUTH}/logout`)
        .set("Cookie", refreshTokenCookie)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Verify cookie is cleared
      const clearCookie = logoutRes.headers["set-cookie"];
      expect(clearCookie).toBeDefined();
      expect(Array.isArray(clearCookie)).toBeTruthy();
      expect(clearCookie![0]).toContain("refreshToken=;");
    }, 8000);

    it("should return 401 if refresh token is missing", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/logout`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    }, 8000);

    it("should return 401 if refresh token is invalid", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/logout`)
        .set("Cookie", "refreshToken=invalid.token.here")
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    }, 8000);

    it("should return 401 if refresh token is already used (in blacklist)", async () => {
      // Create user
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      // Login to get tokens
      const loginRes = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.OK_200);

      // Get refresh token from cookies
      const cookies = loginRes.headers["set-cookie"];
      const refreshTokenCookie = cookies[0];

      // First logout - should succeed
      await req
        .post(`${SETTINGS.PATH.AUTH}/logout`)
        .set("Cookie", refreshTokenCookie)
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Try to logout again with same token - should fail since token is in blacklist
      await req
        .post(`${SETTINGS.PATH.AUTH}/logout`)
        .set("Cookie", refreshTokenCookie)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    }, 8000);
  });
});

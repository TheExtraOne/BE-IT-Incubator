import { HTTP_STATUS, SETTINGS } from "../../../src/common/settings";
import {
  correctUserBodyParams,
  req,
  userCredentials,
  testDb,
} from "../helpers";

describe("POST /auth/refresh-token", () => {
  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  describe("Refresh token success/failure", () => {
    it("should return 200 and new tokens if refresh token is valid", async () => {
      // Create user, used endpoint does not require mail confirmation
      await req
        .post(SETTINGS.PATH.USERS)
        .set({ Authorization: userCredentials.correct })
        .send(correctUserBodyParams)
        .expect(HTTP_STATUS.CREATED_201);

      // Login to get initial tokens
      const loginRes = await req
        .post(`${SETTINGS.PATH.AUTH}/login`)
        .send({
          loginOrEmail: correctUserBodyParams.login,
          password: correctUserBodyParams.password,
        })
        .expect(HTTP_STATUS.OK_200);

      // Get refresh token from cookies
      const cookies = loginRes.headers["set-cookie"];
      const refreshTokenCookie = cookies[0]; // Take the first cookie which should be the refresh token

      // Try to refresh tokens
      const refreshRes = await req
        .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
        .set("Cookie", refreshTokenCookie)
        .expect(HTTP_STATUS.OK_200);

      expect(refreshRes.body).toEqual({ accessToken: expect.any(String) });

      const newCookies = refreshRes.headers["set-cookie"];
      expect(newCookies).toBeDefined();
      expect(Array.isArray(newCookies)).toBeTruthy();
      expect(newCookies![0].startsWith("refreshToken=")).toBeTruthy();
    });

    it("should return 401 if refresh token is missing", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 401 if refresh token is invalid", async () => {
      await req
        .post(`${SETTINGS.PATH.AUTH}/refresh-token`)
        .set("Cookie", "refreshToken=invalid.token.here")
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });
  });
});

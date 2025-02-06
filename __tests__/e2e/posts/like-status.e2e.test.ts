import {
  SETTINGS,
  HTTP_STATUS,
  LIKE_STATUS,
} from "../../../src/common/settings";
import {
  incorrectId,
  req,
  userCredentials,
  correctPostBodyParams,
  correctUserBodyParams,
  correctBlogBodyParams,
  testDb,
} from "../helpers";

describe("PUT /posts/:postId/like-status", () => {
  let accessToken1: string;
  let accessToken2: string;
  let postId: string;
  let userId1: string;
  let userId2: string;

  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  beforeEach(async () => {
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);

    // Create two users
    await req
      .post(SETTINGS.PATH.USERS)
      .set({ Authorization: userCredentials.correct })
      .send(correctUserBodyParams)
      .expect(HTTP_STATUS.CREATED_201);

    await req
      .post(SETTINGS.PATH.USERS)
      .set({ Authorization: userCredentials.correct })
      .send({
        ...correctUserBodyParams,
        login: "user2",
        email: "user2@test.com",
      })
      .expect(HTTP_STATUS.CREATED_201);

    // Login both users
    const loginResponse1 = await req
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({
        loginOrEmail: correctUserBodyParams.login,
        password: correctUserBodyParams.password,
      })
      .expect(HTTP_STATUS.OK_200);

    accessToken1 = loginResponse1.body.accessToken;
    userId1 = loginResponse1.body.userId;

    const loginResponse2 = await req
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({
        loginOrEmail: "user2",
        password: correctUserBodyParams.password,
      })
      .expect(HTTP_STATUS.OK_200);

    accessToken2 = loginResponse2.body.accessToken;
    userId2 = loginResponse2.body.userId;

    // Create a blog
    const blogResponse = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(HTTP_STATUS.CREATED_201);

    const blogId = blogResponse.body.id;

    // Create a post
    const postResponse = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(HTTP_STATUS.CREATED_201);

    postId = postResponse.body.id;
  });

  describe("Authentication and Authorization", () => {
    it("should return 401 if user is not authenticated", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .send({ likeStatus: LIKE_STATUS.LIKE })
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    }, 8000);
  });

  describe("Input Validation", () => {
    it("should return 404 if post not found", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${incorrectId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.LIKE })
        .expect(HTTP_STATUS.NOT_FOUND_404);
    }, 8000);

    it("should return 400 if likeStatus has incorrect value", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "invalid_status" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);
    }, 8000);
  });

  describe("Basic Like Operations", () => {
    it("should successfully like the post", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.LIKE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const response = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(HTTP_STATUS.OK_200);

      expect(response.body.extendedLikesInfo.likesCount).toBe(1);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(response.body.extendedLikesInfo.myStatus).toBe(LIKE_STATUS.LIKE);
    }, 8000);

    it("should successfully dislike the post", async () => {
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.DISLIKE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const response = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(HTTP_STATUS.OK_200);

      expect(response.body.extendedLikesInfo.likesCount).toBe(0);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(response.body.extendedLikesInfo.myStatus).toBe(
        LIKE_STATUS.DISLIKE
      );
    }, 8000);

    it("should successfully remove like/dislike status", async () => {
      // First like the post
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.LIKE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Then remove the like
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.NONE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const response = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(HTTP_STATUS.OK_200);

      expect(response.body.extendedLikesInfo.likesCount).toBe(0);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(response.body.extendedLikesInfo.myStatus).toBe(LIKE_STATUS.NONE);
    }, 8000);
  });

  describe("Multi-User Interactions", () => {
    it("should show correct likes info for multiple users", async () => {
      // First user likes the post
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.LIKE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Second user dislikes the post
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.DISLIKE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Check first user's view
      const response1 = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(HTTP_STATUS.OK_200);

      expect(response1.body.extendedLikesInfo.likesCount).toBe(1);
      expect(response1.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(response1.body.extendedLikesInfo.myStatus).toBe(LIKE_STATUS.LIKE);

      // Check second user's view
      const response2 = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .auth(accessToken2, { type: "bearer" })
        .expect(HTTP_STATUS.OK_200);

      expect(response2.body.extendedLikesInfo.likesCount).toBe(1);
      expect(response2.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(response2.body.extendedLikesInfo.myStatus).toBe(
        LIKE_STATUS.DISLIKE
      );
    }, 8000);
  });

  describe("Status Changes", () => {
    it("should update like status when user changes their mind", async () => {
      // First like the post
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.LIKE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Then change to dislike
      await req
        .put(`${SETTINGS.PATH.POSTS}/${postId}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: LIKE_STATUS.DISLIKE })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      const response = await req
        .get(`${SETTINGS.PATH.POSTS}/${postId}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(HTTP_STATUS.OK_200);

      expect(response.body.extendedLikesInfo.likesCount).toBe(0);
      expect(response.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(response.body.extendedLikesInfo.myStatus).toBe(
        LIKE_STATUS.DISLIKE
      );
    }, 8000);
  });
});

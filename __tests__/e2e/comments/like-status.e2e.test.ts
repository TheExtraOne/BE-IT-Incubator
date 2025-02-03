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

describe("PUT /comments/:commentId/like-status", () => {
  let accessToken1: string;
  let accessToken2: string;
  let postId: string;
  let commentId: string;
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

    // Create a comment
    const commentResponse = await req
      .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
      .auth(accessToken1, { type: "bearer" })
      .send({ content: "Test comment content" })
      .expect(HTTP_STATUS.CREATED_201);
    
    commentId = commentResponse.body.id;
  });

  it("should return 401 if user is not authenticated", async () => {
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .send({ likeStatus: LIKE_STATUS.LIKE })
      .expect(HTTP_STATUS.UNAUTHORIZED_401);
  });

  it("should return 404 if comment does not exist", async () => {
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${incorrectId}/like-status`)
      .auth(accessToken1, { type: "bearer" })
      .send({ likeStatus: LIKE_STATUS.LIKE })
      .expect(HTTP_STATUS.NOT_FOUND_404);
  });

  it("should return 400 if likeStatus is invalid", async () => {
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .auth(accessToken1, { type: "bearer" })
      .send({ likeStatus: "INVALID_STATUS" })
      .expect(HTTP_STATUS.BAD_REQUEST_400);
  });

  it("should successfully like a comment", async () => {
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .auth(accessToken1, { type: "bearer" })
      .send({ likeStatus: LIKE_STATUS.LIKE })
      .expect(HTTP_STATUS.NO_CONTENT_204);

    // Verify the like was applied
    const commentResponse = await req
      .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
      .auth(accessToken1, { type: "bearer" })
      .expect(HTTP_STATUS.OK_200);

    expect(commentResponse.body.likesInfo.myStatus).toBe(LIKE_STATUS.LIKE);
    expect(commentResponse.body.likesInfo.likesCount).toBe(1);
    expect(commentResponse.body.likesInfo.dislikesCount).toBe(0);
  });

  it("should successfully dislike a comment", async () => {
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .auth(accessToken1, { type: "bearer" })
      .send({ likeStatus: LIKE_STATUS.DISLIKE })
      .expect(HTTP_STATUS.NO_CONTENT_204);

    // Verify the dislike was applied
    const commentResponse = await req
      .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
      .auth(accessToken1, { type: "bearer" })
      .expect(HTTP_STATUS.OK_200);

    expect(commentResponse.body.likesInfo.myStatus).toBe(LIKE_STATUS.DISLIKE);
    expect(commentResponse.body.likesInfo.likesCount).toBe(0);
    expect(commentResponse.body.likesInfo.dislikesCount).toBe(1);
  });

  it("should successfully remove like/dislike status", async () => {
    // First like the comment
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .auth(accessToken1, { type: "bearer" })
      .send({ likeStatus: LIKE_STATUS.LIKE })
      .expect(HTTP_STATUS.NO_CONTENT_204);

    // Then remove the like
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .auth(accessToken1, { type: "bearer" })
      .send({ likeStatus: LIKE_STATUS.NONE })
      .expect(HTTP_STATUS.NO_CONTENT_204);

    // Verify the like was removed
    const commentResponse = await req
      .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
      .auth(accessToken1, { type: "bearer" })
      .expect(HTTP_STATUS.OK_200);

    expect(commentResponse.body.likesInfo.myStatus).toBe(LIKE_STATUS.NONE);
    expect(commentResponse.body.likesInfo.likesCount).toBe(0);
    expect(commentResponse.body.likesInfo.dislikesCount).toBe(0);
  });

  it("should handle multiple users liking the same comment", async () => {
    // First user likes the comment
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .auth(accessToken1, { type: "bearer" })
      .send({ likeStatus: LIKE_STATUS.LIKE })
      .expect(HTTP_STATUS.NO_CONTENT_204);

    // Second user dislikes the comment
    await req
      .put(`${SETTINGS.PATH.COMMENTS}/${commentId}/like-status`)
      .auth(accessToken2, { type: "bearer" })
      .send({ likeStatus: LIKE_STATUS.DISLIKE })
      .expect(HTTP_STATUS.NO_CONTENT_204);

    // Verify likes count for first user
    const commentResponse1 = await req
      .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
      .auth(accessToken1, { type: "bearer" })
      .expect(HTTP_STATUS.OK_200);

    expect(commentResponse1.body.likesInfo.myStatus).toBe(LIKE_STATUS.LIKE);
    expect(commentResponse1.body.likesInfo.likesCount).toBe(1);
    expect(commentResponse1.body.likesInfo.dislikesCount).toBe(1);

    // Verify likes count for second user
    const commentResponse2 = await req
      .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
      .auth(accessToken2, { type: "bearer" })
      .expect(HTTP_STATUS.OK_200);

    expect(commentResponse2.body.likesInfo.myStatus).toBe(LIKE_STATUS.DISLIKE);
    expect(commentResponse2.body.likesInfo.likesCount).toBe(1);
    expect(commentResponse2.body.likesInfo.dislikesCount).toBe(1);
  });
});

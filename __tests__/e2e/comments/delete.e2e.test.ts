import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  incorrectId,
  req,
  userCredentials,
  correctPostBodyParams,
  correctUserBodyParams,
  correctBlogBodyParams,
  testDb,
} from "../helpers";

describe("DELETE /comments", () => {
  let accessToken: string;
  let postId: string;
  let commentId: string;

  beforeAll(async () => await testDb.setup());

  afterEach(async () => await testDb.clear());

  afterAll(async () => await testDb.teardown());

  beforeEach(async () => {
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);

    // Create a user and get access token
    await req
      .post(SETTINGS.PATH.USERS)
      .set({ Authorization: userCredentials.correct })
      .send(correctUserBodyParams)
      .expect(HTTP_STATUS.CREATED_201);

    const {
      body: { accessToken: token },
    } = await req
      .post(`${SETTINGS.PATH.AUTH}/login`)
      .send({
        loginOrEmail: correctUserBodyParams.login,
        password: correctUserBodyParams.password,
      })
      .expect(HTTP_STATUS.OK_200);

    accessToken = token;

    // Create a blog
    const {
      body: { id: blogId },
    } = await req
      .post(SETTINGS.PATH.BLOGS)
      .set({ Authorization: userCredentials.correct })
      .send(correctBlogBodyParams)
      .expect(HTTP_STATUS.CREATED_201);

    // Create a post
    const {
      body: { id },
    } = await req
      .post(SETTINGS.PATH.POSTS)
      .set({ Authorization: userCredentials.correct })
      .send({ ...correctPostBodyParams, blogId })
      .expect(HTTP_STATUS.CREATED_201);

    postId = id;

    // Create a comment
    const {
      body: { id: cId },
    } = await req
      .post(`${SETTINGS.PATH.POSTS}/${postId}/comments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({ content: "Test comment content" })
      .expect(HTTP_STATUS.CREATED_201);

    commentId = cId;
  });

  describe("Comment deletion", () => {
    it("should return 401 if no authorization token provided", async () => {
      await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 404 if comment does not exist", async () => {
      await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${incorrectId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 403 if trying to delete someone else's comment", async () => {
      // Create another user and get their token
      const res = await req
        .post(`${SETTINGS.PATH.USERS}`)
        .set({ Authorization: userCredentials.correct })
        .send({
          login: "user2",
          password: "password2",
          email: "user2@example.com",
        })
        .expect(HTTP_STATUS.CREATED_201);

      const otherUserToken = (
        await req
          .post(`${SETTINGS.PATH.AUTH}/login`)
          .send({
            loginOrEmail: "user2",
            password: "password2",
          })
          .expect(HTTP_STATUS.OK_200)
      ).body.accessToken;

      await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set({ Authorization: `Bearer ${otherUserToken}` })
        .expect(HTTP_STATUS.FORBIDDEN_403);
    });

    it("should return 204 and delete comment if authorized", async () => {
      await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Verify comment was deleted
      await req
        .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });
  });
});

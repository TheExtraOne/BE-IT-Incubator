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

describe("GET /comments", () => {
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

  describe("Comment retrieval", () => {
    it("should return 404 if comment id does not exist", async () => {
      await req
        .get(`${SETTINGS.PATH.COMMENTS}/${incorrectId}`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 404 if comment was deleted", async () => {
      // Delete the comment first
      await req
        .delete(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Try to get the deleted comment
      await req
        .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 200 and comment data if comment exists", async () => {
      const res = await req
        .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body).toEqual({
        id: commentId,
        content: "Test comment content",
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: correctUserBodyParams.login,
        },
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: expect.any(Number),
          dislikesCount: expect.any(Number),
          myStatus: LIKE_STATUS.NONE,
        },
      });
    });
  });
});

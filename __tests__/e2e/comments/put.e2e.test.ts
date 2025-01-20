import { SETTINGS, HTTP_STATUS } from "../../../src/common/settings";
import {
  incorrectId,
  req,
  userCredentials,
  correctPostBodyParams,
  correctUserBodyParams,
  correctBlogBodyParams,
} from "../helpers";
import { client, connectToDb } from "../../../src/db/db";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("PUT /comments", () => {
  let server: MongoMemoryServer;
  let accessToken: string;
  let postId: string;
  let commentId: string;

  beforeAll(async () => {
    server = await MongoMemoryServer.create();
    const uri = server.getUri();
    await connectToDb(uri);
  });

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

  afterEach(async () => {
    await req.delete(`${SETTINGS.PATH.TESTING}/all-data`);
  });

  afterAll(async () => {
    await client.close();
    await server.stop();
  });

  describe("Comment update", () => {
    it("should return 401 if no authorization token provided", async () => {
      await req
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .send({ content: "Brand new updated content" })
        .expect(HTTP_STATUS.UNAUTHORIZED_401);
    });

    it("should return 404 if comment does not exist", async () => {
      await req
        .put(`${SETTINGS.PATH.COMMENTS}/${incorrectId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: "Brand new updated content" })
        .expect(HTTP_STATUS.NOT_FOUND_404);
    });

    it("should return 400 if content is empty", async () => {
      const res = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: "" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body).toEqual({
        errorsMessages: [
          {
            message: "Content is a required field",
            field: "content",
          },
        ],
      });
    });

    it("should return 400 if content is too short", async () => {
      const res = await req
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: "New content" })
        .expect(HTTP_STATUS.BAD_REQUEST_400);

      expect(res.body).toEqual({
        errorsMessages: [
          {
            message: "Incorrect length. Min = 20, max = 300",
            field: "content",
          },
        ],
      });
    });

    it("should return 403 if trying to update someone else's comment", async () => {
      // Create another user and get their token
      await req
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
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set({ Authorization: `Bearer ${otherUserToken}` })
        .send({ content: "Updated by other user" })
        .expect(HTTP_STATUS.FORBIDDEN_403);
    });

    it("should return 204 and update comment if input is valid", async () => {
      const newContent = "Updated comment content";

      await req
        .put(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ content: newContent })
        .expect(HTTP_STATUS.NO_CONTENT_204);

      // Verify the comment was updated
      const res = await req
        .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
        .expect(HTTP_STATUS.OK_200);

      expect(res.body.content).toBe(newContent);
    });
  });
});

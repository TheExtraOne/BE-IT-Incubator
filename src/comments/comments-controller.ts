import { Response } from "express";
import { SORT_DIRECTION, STATUS } from "../settings";
import { TRequestWithBody } from "../types/types";
import usersQueryRepository from "../users/users-query-repository";

const commentsController = {
  //   getComments: async (req: TRequestWithQuery<TQueryPostModel>, res: Response) => {
  //     const {
  //       pageNumber = 1,
  //       pageSize = 10,
  //       sortBy = "createdAt",
  //       sortDirection = SORT_DIRECTION.DESC,
  //     } = req.query;
  //     // We are reaching out to postsQueryRepository directly because of CQRS
  //     const posts: TResponseWithPagination<TPostControllerViewModel[] | []> =
  //       await postsQueryRepository.getAllPosts({
  //         blogId: null,
  //         pageNumber: +pageNumber,
  //         pageSize: +pageSize,
  //         sortBy,
  //         sortDirection,
  //       });
  //     res.status(STATUS.OK_200).json(posts);
  //   },
  //   getComment: async (
  //     req: TRequestWithParams<TPathParamsPostModel>,
  //     res: Response
  //   ) => {
  //     // We are reaching out to postsQueryRepository directly because of CQRS
  //     const post: TPostControllerViewModel | null =
  //       await postsQueryRepository.getPostById(req.params.id);
  //     post
  //       ? res.status(STATUS.OK_200).json(post)
  //       : res.sendStatus(STATUS.NOT_FOUND_404);
  //   },
  //   updateComment: async (
  //     req: TRequestWithParamsAndBody<
  //       TPathParamsPostModel,
  //       TPostControllerInputModel
  //     >,
  //     res: Response
  //   ) => {
  //     const { title, shortDescription, content, blogId } = req.body;
  //     const success = await postsService.updatePostById({
  //       id: req.params.id,
  //       title,
  //       shortDescription,
  //       content,
  //       blogId,
  //     });
  //     success
  //       ? res.sendStatus(STATUS.NO_CONTENT_204)
  //       : res.sendStatus(STATUS.NOT_FOUND_404);
  //   },
  //   deleteComment: async (
  //     req: TRequestWithParams<TPathParamsPostModel>,
  //     res: Response
  //   ) => {
  //     const success = await postsService.deletePostById(req.params.id);
  //     res.sendStatus(success ? STATUS.NO_CONTENT_204 : STATUS.NOT_FOUND_404);
  //   },
};

export default commentsController;

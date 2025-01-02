import { Router, Request, Response } from "express";
import { STATUS } from "../settings";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
} from "../types";
import { TVideoCreateInputModel } from "../models/VideoCreateModel";
import { TVideoUpdateModel } from "../models/VideoUpdateModel";
import { TVideoViewModel } from "../models/VideoViewModel";
import { TPathParamsVideoModel } from "../models/PathParamsVideoModel";
import { videosRepository } from "../repositories/videos-repositories";

export const videosRouter = Router({});

const videoController = {
  getVideos: (req: Request, res: Response<TVideoViewModel[]>) => {
    const foundVideos = videosRepository.findVideos(
      req.query?.title?.toString()
    );

    res.status(STATUS.OK_200).json(foundVideos);
  },
  getVideo: (
    req: TRequestWithParams<TPathParamsVideoModel>,
    res: Response<TVideoViewModel>
  ) => {
    const result = videosRepository.findVideoById(+req.params.id);

    result
      ? res.status(STATUS.OK_200).json(result)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },
  createVideo: (
    req: TRequestWithBody<TVideoCreateInputModel>,
    res: Response
  ) => {
    const { title, author, availableResolutions = null } = req.body;
    const { errors, newVideo } = videosRepository.createVideo({
      title,
      author,
      availableResolutions,
    });

    if (errors.errorsMessages.length) {
      res.status(STATUS.BAD_REQUEST_400).json(errors);
      return;
    }

    res.status(STATUS.CREATED_201).json(newVideo);
  },
  updateVideo: (
    req: TRequestWithParamsAndBody<TPathParamsVideoModel, TVideoUpdateModel>,
    res: Response
  ) => {
    const result = videosRepository.findVideoById(+req.params.id);

    if (!result) {
      res.sendStatus(STATUS.NOT_FOUND_404);
      return;
    }

    const {
      title,
      author,
      canBeDownloaded,
      minAgeRestriction,
      availableResolutions,
      publicationDate,
    } = req.body;

    const { errors, isSuccessful } = videosRepository.updateVideoById({
      id: +req.params.id,
      title,
      author,
      canBeDownloaded,
      minAgeRestriction,
      availableResolutions,
      publicationDate,
    });

    isSuccessful
      ? res.sendStatus(STATUS.NO_CONTENT_204)
      : res.status(STATUS.BAD_REQUEST_400).json(errors);
  },
  deleteVideo: (
    req: TRequestWithParams<TPathParamsVideoModel>,
    res: Response
  ) => {
    const { isSuccessful } = videosRepository.deleteVideo(+req.params.id);

    isSuccessful
      ? res.sendStatus(STATUS.NO_CONTENT_204)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },
};

videosRouter.get("/", videoController.getVideos);
videosRouter.get("/:id", videoController.getVideo);
videosRouter.post("/", videoController.createVideo);
videosRouter.put("/:id", videoController.updateVideo);
videosRouter.delete("/:id", videoController.deleteVideo);

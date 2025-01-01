import { Router, Request, Response } from "express";
import { STATUS } from "../settings";
import { db } from "../db/db";
import {
  TRequestWithBody,
  TRequestWithParams,
  TRequestWithParamsAndBody,
} from "../types";
import { TVideoCreateInputModel } from "../models/VideoCreateModel";
import { TVideoUpdateModel } from "../models/VideoUpdateModel";
import { TVideoViewModel } from "../models/VideoViewModel";
import { TPathParamsVideoModel } from "../models/PathParamsVideoModel";
import { TApiErrorResult } from "../validation/field-validation";
import { fieldValidator } from "../validation/field-validation";

export const videosRouter = Router({});

const videoController = {
  getVideos: (_req: Request, res: Response<TVideoViewModel[]>) => {
    res.status(STATUS.OK_200).json(db.videos);
  },
  getVideo: (
    req: TRequestWithParams<TPathParamsVideoModel>,
    res: Response<TVideoViewModel>
  ) => {
    const result = db.videos.find((video) => video?.id === +req.params.id);

    result
      ? res.status(STATUS.OK_200).json(result)
      : res.sendStatus(STATUS.NOT_FOUND_404);
  },
  createVideo: (
    req: TRequestWithBody<TVideoCreateInputModel>,
    res: Response
  ) => {
    const { title, author, availableResolutions = null } = req.body;

    const errors: TApiErrorResult = {
      errorsMessages: [],
    };
    errors.errorsMessages.push(
      ...fieldValidator.validateTitle(title),
      ...fieldValidator.validateAuthor(author),
      ...fieldValidator.validateAvailableResolutions(availableResolutions)
    );

    if (errors.errorsMessages.length) {
      res.status(STATUS.BAD_REQUEST_400).json(errors);
      return;
    }

    const createdAt = new Date();
    const day = 60 * 60 * 24 * 1000;

    const newInputModel = {
      title,
      author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      availableResolutions,
      id: Date.now() + Math.random(),
      createdAt: createdAt.toISOString(),
      publicationDate: new Date(createdAt.getTime() + day).toISOString(),
    };

    db.videos = [...db.videos, newInputModel];
    res.status(STATUS.CREATED_201).json(newInputModel);
  },
  updateVideo: (
    req: TRequestWithParamsAndBody<TPathParamsVideoModel, TVideoUpdateModel>,
    res: Response
  ) => {
    const result = db.videos.find((video) => video?.id === +req.params.id);

    if (!result) {
      res.sendStatus(STATUS.NOT_FOUND_404);
      return;
    }

    const {
      title: newTitle,
      author: newAuthor,
      canBeDownloaded: newCanBeDownloadedFlag,
      minAgeRestriction: newMinAgeRestriction,
      availableResolutions: newAvailableResolutions,
      publicationDate: newPublicationDate,
    } = req.body;

    const errors: TApiErrorResult = {
      errorsMessages: [],
    };
    errors.errorsMessages.push(
      ...fieldValidator.validateTitle(newTitle),
      ...fieldValidator.validateAuthor(newAuthor),
      ...fieldValidator.validateCanBeDownloadedFlag(newCanBeDownloadedFlag),
      ...fieldValidator.validateMinAgeRestriction(newMinAgeRestriction),
      ...fieldValidator.validateAvailableResolutions(newAvailableResolutions),
      ...fieldValidator.validatePublicationDate(newPublicationDate)
    );

    if (errors.errorsMessages.length) {
      res.status(STATUS.BAD_REQUEST_400).json(errors);
      return;
    }

    Object.assign(result, {
      title: newTitle,
      author: newAuthor,
      canBeDownloaded: newCanBeDownloadedFlag ?? result.canBeDownloaded,
      minAgeRestriction:
        typeof newMinAgeRestriction !== "undefined"
          ? newMinAgeRestriction
          : result.minAgeRestriction,
      availableResolutions:
        typeof newAvailableResolutions !== "undefined"
          ? newAvailableResolutions
          : result.availableResolutions,
      publicationDate: newPublicationDate ?? result.publicationDate,
    });

    res.sendStatus(STATUS.NO_CONTENT_204);
  },
  deleteVideo: (
    req: TRequestWithParams<TPathParamsVideoModel>,
    res: Response
  ) => {
    const result = db.videos.filter((video) => video?.id !== +req.params.id);

    if (result.length === db.videos.length) {
      res.sendStatus(STATUS.NOT_FOUND_404);
      return;
    }

    db.videos = result;
    res.sendStatus(STATUS.NO_CONTENT_204);
  },
};

videosRouter.get("/", videoController.getVideos);
videosRouter.get("/:id", videoController.getVideo);
videosRouter.post("/", videoController.createVideo);
videosRouter.put("/:id", videoController.updateVideo);
videosRouter.delete("/:id", videoController.deleteVideo);

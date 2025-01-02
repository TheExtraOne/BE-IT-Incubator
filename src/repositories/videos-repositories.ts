import { TResolutions } from "../settings";
import { db } from "../db/db";
import { TApiErrorResult } from "../validation/field-validation";
import { fieldValidator } from "../validation/field-validation";

export const videosRepository = {
  findVideos: (title?: string) => {
    if (title) return db.videos.filter((video) => video.title === title) ?? [];

    return db.videos;
  },

  findVideoById: (id: number) => {
    const result = db.videos.find((video) => video?.id === id);

    return result;
  },

  createVideo: ({
    title,
    author,
    availableResolutions,
  }: {
    title: string;
    author: string;
    availableResolutions: null | TResolutions[];
  }) => {
    const errors: TApiErrorResult = {
      errorsMessages: [],
    };
    errors.errorsMessages.push(
      ...fieldValidator.validateTitle(title),
      ...fieldValidator.validateAuthor(author),
      ...fieldValidator.validateAvailableResolutions(availableResolutions)
    );

    if (errors.errorsMessages.length) return { errors, newVideo: null };

    const createdAt = new Date();
    const day = 60 * 60 * 24 * 1000;

    const newVideo = {
      title,
      author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      availableResolutions,
      id: Date.now() + Math.random(),
      createdAt: createdAt.toISOString(),
      publicationDate: new Date(createdAt.getTime() + day).toISOString(),
    };

    db.videos = [...db.videos, newVideo];

    return { errors, newVideo };
  },

  updateVideoById: ({
    id,
    title,
    author,
    canBeDownloaded,
    minAgeRestriction,
    publicationDate,
    availableResolutions,
  }: {
    id: number;
    title: string;
    author: string;
    canBeDownloaded?: boolean;
    minAgeRestriction?: number | null;
    publicationDate?: string;
    availableResolutions?: null | TResolutions[];
  }) => {
    const errors: TApiErrorResult = {
      errorsMessages: [],
    };
    const result = videosRepository.findVideoById(id);

    if (!result) {
      errors.errorsMessages.push({
        message: "Video does not exist",
        field: "id",
      });
      return { errors, isSuccessful: false };
    }

    errors.errorsMessages.push(
      ...fieldValidator.validateTitle(title),
      ...fieldValidator.validateAuthor(author),
      ...fieldValidator.validateCanBeDownloadedFlag(canBeDownloaded),
      ...fieldValidator.validateMinAgeRestriction(minAgeRestriction),
      ...fieldValidator.validateAvailableResolutions(availableResolutions),
      ...fieldValidator.validatePublicationDate(publicationDate)
    );

    if (errors.errorsMessages.length) return { errors, isSuccessful: false };

    Object.assign(result, {
      title,
      author,
      canBeDownloaded: canBeDownloaded ?? result.canBeDownloaded,
      minAgeRestriction:
        typeof minAgeRestriction !== "undefined"
          ? minAgeRestriction
          : result.minAgeRestriction,
      availableResolutions:
        typeof availableResolutions !== "undefined"
          ? availableResolutions
          : result.availableResolutions,
      publicationDate: publicationDate ?? result.publicationDate,
    });

    return { errors, isSuccessful: true };
  },

  deleteVideo: (id: number) => {
    const result = db.videos.filter((video) => video?.id !== id);

    if (result.length === db.videos.length) return { isSuccessful: false };

    db.videos = result;

    return { isSuccessful: true };
  },
};

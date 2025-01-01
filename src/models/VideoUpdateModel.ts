import { TResolutions } from "../settings";

export type TVideoUpdateModel = {
  /**
   * video title
   */
  title: string;
  /**
   * video author
   */
  author: string;
  /**
   * flag if video can be loaded. False by default
   */
  canBeDownloaded?: boolean;
  /**
   * minimum age restriction. Max = 18, min = 1, default null
   */
  minAgeRestriction?: number | null;
  /**
   * date of publication in ISO. Default +1 day from createdAt
   */
  publicationDate?: string;
  /**
   * list of strings with available resolutions. Default - null
   */
  availableResolutions?: null | TResolutions[];
};

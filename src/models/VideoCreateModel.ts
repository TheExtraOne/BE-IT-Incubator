import { TResolutions } from "../settings";

export type TVideoCreateInputModel = {
  /**
   * video title
   */
  title: string;
  /**
   * video author
   */
  author: string;
  /**
   * list of strings with available resolutions. Default - null
   */
  availableResolutions?: null | TResolutions[];
};

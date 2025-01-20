import { TSortDirection } from "../../common/types/types";

type TQueryPostModel = {
  /**
   * pageNumber is number of portions that should be returned
   */
  pageNumber?: number;
  /**
   * pageSize is portions size that should be returned
   */
  pageSize?: number;
  /**
   * field for sorting
   */
  sortBy?: string;
  /**
   * direction of sorting
   */
  sortDirection?: TSortDirection;
};

export default TQueryPostModel;

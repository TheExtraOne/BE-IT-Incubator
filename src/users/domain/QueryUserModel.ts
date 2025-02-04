import { SORT_DIRECTION } from "../../common/settings";

type TQueryUserModel = {
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
  sortDirection?: SORT_DIRECTION;
  /**
   * filter by login
   */
  searchLoginTerm?: string;
  /**
   * filter by email
   */
  searchEmailTerm?: string;
};

export default TQueryUserModel;

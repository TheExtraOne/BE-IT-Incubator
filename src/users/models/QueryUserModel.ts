import { TSortDirection } from "../../common/types/types";

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
  sortDirection?: TSortDirection;
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

import { SORT_DIRECTION } from "../../common/settings";

type TQueryBlogModel = {
  /**
   * search term for blog Name: Name should contains this term in any position
   */
  searchNameTerm?: string;
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
};

export default TQueryBlogModel;

export interface IListResponse<T> {
  current: number;
  pageSize: number;
  totalPages: number;
  result: T[];
}

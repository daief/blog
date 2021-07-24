import { stringifyParams } from '@app/utils/api';
import { IListResponse } from '@t/common';
import { AxiosInstance } from 'axios';

export function getPostList(
  axios: AxiosInstance,
  data: {
    current?: number;
    pageSize?: number;
    tag?: string;
    category?: string;
  },
): Promise<IListResponse<ggDB.IPost>> {
  return axios
    .get(`/blog-api/post/list/${stringifyParams({ ...data })}.json`)
    .then((resp) => resp.data);
}

export function getPostDetail(
  axios: AxiosInstance,
  id: string,
): Promise<ggDB.IPost> {
  return axios
    .get(`/blog-api/post/detail/${id}.json`)
    .then((resp) => resp.data);
}

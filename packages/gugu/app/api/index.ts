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

export function getSimplePageContent(
  axios: AxiosInstance,
  path: string,
): Promise<ggDB.IPost> {
  return axios
    .get(`/blog-api/simplepage/content/${stringifyParams({ path })}.json`)
    .then((resp) => resp.data);
}

export function getTagList(axios: AxiosInstance): Promise<ggDB.ITag[]> {
  return axios.get('/blog-api/tag/list/data.json').then((resp) => resp.data);
}

export function getCategoryList(axios: AxiosInstance): Promise<ggDB.ITag[]> {
  return axios
    .get('/blog-api/category/list/data.json')
    .then((resp) => resp.data);
}

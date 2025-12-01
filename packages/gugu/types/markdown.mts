export interface IMarkdown {
  type: 'article' | 'page';
  filepath: string;
  slug: string;
  frontmatter: {
    id?: string;
    title: string;
    sort: number;
    date: Date;
    modified?: Date;
    tags: string[];
    description?: string | null;
    comments?: boolean;
    draft: boolean;
  };
  /** 解析后的摘要 */
  excerpt: string;
  /** 解析后的正文内容 */
  more: string;
  /** md 原始内容 */
  rawContent: string;
  toc: ITocItem[];
}

export type ITemplateType =
  /* 文章详情 */
  | 'article'
  /* 文章列表 */
  | 'articles'
  /* 标签汇总 */
  | 'tags'
  /* 标签详情分页 */
  | 'tag';

export interface IRawRoute {
  /** vue 文件的虚拟模块 id */
  vid: string;
  path: string;
  template: ITemplateType;
  data: any;
  meta?: Record<string, any>;
}

export interface ITocItem {
  id: string;
  text: string;
  level: number;
  /** parentId */
  parent?: string;
  children?: ITocItem[];
}

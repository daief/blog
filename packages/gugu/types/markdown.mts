export interface IMarkdown {
  type: 'article' | 'page';
  isDraft: boolean;
  filepath: string;
  /** 普通页面才有 */
  slug: string;
  frontmatter: {
    id?: string;
    title: string;
    sort: number;
    date: Date;
    modified?: Date;
    tags: string[];
    description?: string | null;
    comment?: boolean;
  };
  /** 解析后的摘要 */
  excerpt: string;
  /** 解析后的正文内容 */
  more: string;
  /** md 原始内容 */
  rawContent: string;
}

export type ITemplateType = 'article' | 'tags' | 'categories' | 'articles';

export interface IRawRoute {
  /** vue 文件的虚拟模块 id */
  vid: string;
  path: string;
  template: ITemplateType;
  data: any;
}

declare namespace ggDB {
  export interface ITag {
    name: string;
    id: string;
    slug: string;
    path: string;
    postIds: string[];
    postCount?: number;
  }

  export interface ICategory {
    name: string;
    id: string;
    slug: string;
    path: string;
    parentId: string;
    postIds: string[];
    postCount?: number;
  }

  export interface IPost {
    raw: string;
    id: string;
    slug: string;
    path: string;
    title: string;
    comments: boolean;
    published: boolean;
    date: string;
    updated: string;
    tags: ITag[];
    categories: ICategory[];
    min2read?: number;
    wordCount?: string;
    prev?: IPost;
    next?: IPost;
    excerpt: string;
    more: string;
    filename: string;
    hash: string;
    /** 是否文章 */
    isArticle: boolean;

    /** 浏览量，客户端添加 */
    viewCount?: number;
  }

  export interface IDB {
    posts: IPost[];
    categories: ICategory[];
    tags: ITag[];
  }

  export interface IAssetInfo {
    // 资源文件完整路径
    assetFilePath: string;
    // 相对的一段路径
    relativePath: string;
    // 相关联的 md 文件
    referenceMarkdown: string;
    // 资源输出的路径
    targetPath: string;
  }
}

declare namespace ggDB {
  export interface ITag {
    name: string;
    id: string;
    slug: string;
    postIds: string[];
  }

  export interface ICategory {
    name: string;
    id: string;
    slug: string;
    parentId: string;
    postIds: string[];
  }

  export interface IPost {
    raw: string;
    id: string;
    slug: string;
    title: string;
    comments: boolean;
    // link: string;
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
    tocHtml?: string;
    filename: string;
  }

  export interface IDB {
    posts: IPost[];
    pages: IPost[];
    categories: ICategory[];
    tags: ITag[];
  }
}

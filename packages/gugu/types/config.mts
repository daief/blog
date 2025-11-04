export interface IBlogConifg {
  mode: string;
  title: string;
  url: string;
  description?: string;
  author?: string;
  since?: number;
  googleAnalytics?: {
    id: string;
  };
}

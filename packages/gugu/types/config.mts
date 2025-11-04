export interface IBlogConifg {
  mode: string;
  title: string;
  description?: string;
  author?: string;
  since?: number;
  googleAnalytics?: {
    GA_MEASUREMENT_ID: string;
  };
}

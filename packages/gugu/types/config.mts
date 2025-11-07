export interface IBlogConifg {
  mode: string;
  title: string;
  url: string;
  description?: string;
  author?: string;
  avatar?: string;
  since?: number;
  googleAnalytics?: {
    id: string;
  };
  utteranc?: {
    enable: boolean;
    repo: string;
    'issue-term': string;
    label: string;
    lightTheme: string;
    darkTheme: string;
  };
}

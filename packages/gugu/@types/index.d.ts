export interface IUserConfig {
  /** 站点名称 */
  title?: string;
  /** 站点描述 */
  description?: string;
  /** 站点作者 */
  author?: string;
  avatar?: string;
  /** 站点语言 */
  language?: string;
  /** 站点起始时间，年份 */
  since?: string;
  /**
   * 输出目录
   * @default dist
   */
  outDir?: string;
  /**
   * 分页大小
   */
  paginationSize?: number;
  url?: string;
  base?: string;
  /**
   * 代码高亮主题
   */
  highlight?: {
    theme?: string;
  };
  siteMenus?: Record<
    string,
    {
      link: string;
      label: string;
    }
  >;
  primaryColorRGB?: string;
  utteranc?: {
    enable: boolean;
    repo: string;
    'issue-term': string;
    label: string;
    theme: string;
  };
  google_analytics?: {
    GA_MEASUREMENT_ID: string;
  };
}

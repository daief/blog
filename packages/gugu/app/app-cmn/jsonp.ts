export interface IJsonpOptions {
  params?: any;
  callbackKey?: string;
  callbackValue?: string;
  /**
   * @default 5000 ms
   */
  timeout?: number;
}

export function jsonp<T>(url: string, options: IJsonpOptions = {}): Promise<T> {
  const {
    params,
    callbackKey = 'jsonpCallback',
    callbackValue = `fn_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timeout = 5000,
  } = options;

  new URLSearchParams({ ...params, [callbackKey]: callbackValue });

  const script = document.createElement('script');
  script.src =
    url +
    '?' +
    new URLSearchParams({ ...params, [callbackKey]: callbackValue }).toString();
  script.type = 'text/javascript';
  script.defer = true;
  script.referrerPolicy = 'no-referrer-when-downgrade';

  const p = new Promise<T>((resolve, reject) => {
    script.onerror = reject;

    // @ts-ignore
    window[callbackValue] = (val: T) => {
      resolve(val);
    };

    setTimeout(() => reject(new Error('jsonp timeout')), timeout);
  });

  p.finally(() => {
    try {
      // @ts-ignore
      delete window[callbackValue];
      document.body.removeChild(script);
    } catch (error) {
      console.warn('jsonp cleanup error:', error);
    }
  });

  document.body.appendChild(script);

  return p;
}

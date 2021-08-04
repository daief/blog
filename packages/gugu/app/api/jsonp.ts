import { randomId } from '@app/utils/random';
import { stringify } from 'query-string';

export interface IJsonpOptions {
  params?: any;
  callbackKey?: string;
  callbackValue?: string;
}

export function jsonp<T>(url: string, options: IJsonpOptions = {}): Promise<T> {
  const {
    params,
    callbackKey = 'jsonpCallback',
    callbackValue = 'fn' + randomId(),
  } = options;

  const script = document.createElement('script');
  script.src =
    url + '?' + stringify({ ...params, [callbackKey]: callbackValue });
  script.type = 'text/javascript';
  script.defer = true;
  script.referrerPolicy = 'no-referrer-when-downgrade';

  const p = new Promise<T>((resolve, reject) => {
    script.onerror = reject;

    window[callbackValue] = (val: T) => {
      resolve(val);
    };
  });

  p.catch(() => null).then(() => {
    try {
      delete window[callbackValue];
      document.body.removeChild(script);
    } catch (error) {
      console.warn('jsonp cleanup error:', error);
    }
  });

  document.body.appendChild(script);

  return p;
}

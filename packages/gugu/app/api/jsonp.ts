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
    callbackValue = randomId(),
  } = options;

  const p = new Promise<T>((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      url + '?' + stringify({ ...params, [callbackKey]: callbackValue });
    script.type = 'text/javascript';
    script.defer = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.onerror = reject;

    window[callbackValue] = (val: T) => {
      resolve(val);
    };
  });

  p.catch(() => null).then(() => {
    delete window[callbackValue];
  });

  return p;
}

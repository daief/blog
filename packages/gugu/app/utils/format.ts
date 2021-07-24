import dayjs from 'dayjs';

export function formatTime(t: dayjs.ConfigType, format = 'YYYY-MM-DD') {
  const d = dayjs(t);
  if (!d.isValid() || !t) return '-';
  return d.format(format);
}

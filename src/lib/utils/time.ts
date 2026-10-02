import 'temporal-polyfill/global';

export const parseTime = (time: string) => {
  return Temporal.PlainTime.from(time);
};

export const formatTime = (time: string) =>
  parseTime(time).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

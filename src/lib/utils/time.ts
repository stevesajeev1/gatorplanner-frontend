import 'temporal-polyfill/global';

export const formatTime = (time: string) =>
  Temporal.PlainTime.from(time).toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

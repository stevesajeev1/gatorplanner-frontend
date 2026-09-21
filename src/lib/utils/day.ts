const DAYS = {
  M: 'Monday',
  T: 'Tuesday',
  W: 'Wednesday',
  R: 'Thursday',
  F: 'Friday',
  S: 'Saturday',
  U: 'Sunday'
} as const;

export const formatDay = (day: string) => {
  return DAYS[day as keyof typeof DAYS];
};

const hash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

export const getCourseHue = (id: string) => {
  const value = hash(id);
  const hue = value % 360;
  return hue;
};

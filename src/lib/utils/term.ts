export type Term = 'Spring' | 'Summer' | 'Fall';

const TERM_CODES = {
  Spring: 1,
  Summer: 5,
  Fall: 8
} as const;

const TERM_NAMES = Object.fromEntries(
  Object.entries(TERM_CODES).map(([name, code]) => [code, name])
) as Record<(typeof TERM_CODES)[keyof typeof TERM_CODES], keyof typeof TERM_CODES>;

export const getCurrentTerm = (): string => {
  // const now = new Date();
  // const year = now.getFullYear();

  // let termCode: number;

  // if (now.getMonth() < 4) {
  //   termCode = TERM_CODES.Spring;
  // } else if (now.getMonth() < 7) {
  //   termCode = TERM_CODES.Summer;
  // } else {
  //   termCode = TERM_CODES.Fall;
  // }

  const year = 2027;
  const termCode = TERM_CODES.Spring;

  return `2${String(year).slice(-2)}${termCode}`;
};

export const getTermDisplay = (termCode: string): string => {
  const year = `20${termCode.slice(1, 3)}`;
  const term = TERM_NAMES[Number(termCode[3]) as keyof typeof TERM_NAMES];

  return `${term} ${year}`;
};

export const parseTermNumber = (term: number): Term => {
  return TERM_NAMES[term as keyof typeof TERM_NAMES];
};

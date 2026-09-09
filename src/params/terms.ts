import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string) => {
  return /^2\d{2}[158]$/.test(param);
}) satisfies ParamMatcher;
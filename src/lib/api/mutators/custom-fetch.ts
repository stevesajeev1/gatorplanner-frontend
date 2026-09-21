import { PUBLIC_API_URL } from '$env/static/public';

const getUrl = (contextUrl: string): string => {
  return new URL(contextUrl, PUBLIC_API_URL).toString();
};

export type CustomFetchOptions = RequestInit & {
  fetch?: typeof fetch;
};

export const customFetch = async <T>(url: string, options: CustomFetchOptions): Promise<T> => {
  const { fetch: fetchFn = fetch, ...requestOptions } = options;

  const response = await fetchFn(getUrl(url), {
    ...requestOptions,
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};

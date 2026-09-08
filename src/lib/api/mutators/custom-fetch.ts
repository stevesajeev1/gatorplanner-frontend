import { PUBLIC_API_URL } from '$env/static/public';

const getUrl = (contextUrl: string): string => {
  const url = new URL(contextUrl, PUBLIC_API_URL);

  return url.toString();
};

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const requestUrl = getUrl(url);

  const response = await fetch(requestUrl, {
    ...options,
    credentials: 'include'
  });

  const data = await response.json();

  return {
    status: response.status,
    data
  } as T;
};

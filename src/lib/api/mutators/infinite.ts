type PaginatedResponse = {
  offset: number;
  count: number;
  total: number;
};

export const customQueryOptions = <T>(options: T): T => {
  return {
    ...options,
    initialPageParam: 0,
    getNextPageParam: ({ offset, count, total }: PaginatedResponse) => {
      return offset + count < total ? offset + count : undefined;
    }
  };
};

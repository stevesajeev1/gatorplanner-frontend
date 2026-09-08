type PaginatedResponse = {
  offset: number;
  count: number;
  total: number;
};

export const customQueryOptions = <T>(options: T): T => {
  return {
    ...options,
    initialPageParam: 0,
    getNextPageParam: (lastPage: { data: PaginatedResponse }) => {
      const { offset, count, total } = lastPage.data;
      return offset + count < total ? offset + count : undefined;
    }
  };
};

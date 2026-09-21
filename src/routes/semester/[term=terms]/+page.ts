import { prefetchListBuildingsQuery, prefetchListDepartmentsQuery } from '$lib/api/endpoints';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, fetch }) => {
  const { queryClient } = await parent();

  await Promise.all([
    prefetchListBuildingsQuery(queryClient, {
      request: { fetch }
    }),
    prefetchListDepartmentsQuery(queryClient, {
      request: { fetch }
    })
  ]);
};

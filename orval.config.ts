import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    output: {
      mode: 'tags-split',
      target: 'src/lib/api/endpoints',
      schemas: 'src/lib/api/models',
      client: 'svelte-query',
      clean: true,
      override: {
        mutator: {
          path: 'src/lib/api/mutators/custom-fetch.ts',
          name: 'customFetch'
        },
        query: {
          usePrefetch: true,
          useQuery: true
        },
        operations: {
          'search-classes': {
            query: {
              usePrefetch: false,
              useQuery: false,
              useInfinite: true,
              useInfiniteQueryParam: 'offset',
              queryOptions: {
                path: 'src/lib/api/mutators/infinite.ts',
                name: 'customQueryOptions'
              }
            }
          }
        }
      }
    },
    input: {
      target: 'docs/openapi.json'
    }
  }
});

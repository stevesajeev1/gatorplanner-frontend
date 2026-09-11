<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';

  import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
  import { Separator } from '$lib/components/ui/separator';
  import { getCurrentTerm } from '$lib/utils/term';

  import { browser } from '$app/environment';
  import { resolve } from '$app/paths';

  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'

  let { children } = $props();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser
      }
    }
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<QueryClientProvider client={queryClient}>
  <div class="flex h-dvh w-dvw flex-col">
    <!-- Header -->
    <div class="flex items-center gap-2 p-3">
      <!-- Title -->
      <a class="flex text-3xl" href={resolve('/')}>
        <span class="text-orange-500">Gator</span>
        <span class="text-blue-500">Planner</span>
      </a>
      <div class="grow"></div>
      <!-- Navigation -->
      <NavigationMenu.Root>
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Link href={resolve('/degree')}>Degree Plan</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href={resolve('/semester/[term=terms]', { term: getCurrentTerm() })}>Semester Plan</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <!-- Profile -->
      <a class="aspect-square rounded-full border-2" href={resolve('/profile')}>Me</a>
    </div>
    <Separator />
    <!-- Content -->
    <div class="grow">
      {@render children()}
    </div>
    <Separator />
    <!-- Footer -->
    <div class="flex justify-center p-1">
      <span>Made with ❤️ by Steve Sajeev</span>
    </div>
  </div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';

  import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
  import { Separator } from '$lib/components/ui/separator';
  import { getCurrentTerm } from '$lib/utils/term';
  import LinkedinIcon from '@iconify-svelte/fa6-brands/linkedin';
  import GithubIcon from '@iconify-svelte/fa6-brands/github';
  import { Button } from '$lib/components/ui/button/index.js';

  import { browser } from '$app/environment';
  import { resolve } from '$app/paths';

  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';

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
            <NavigationMenu.Link
              href={resolve('/semester/[term=terms]', { term: getCurrentTerm() })}
              >Semester Plan</NavigationMenu.Link
            >
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
      <!-- Profile -->
      <a class="aspect-square rounded-full border-2" href={resolve('/profile')}>Me</a>
    </div>
    <Separator />
    <!-- Content -->
    <div class="min-h-0 grow">
      {@render children()}
    </div>
    <Separator />
    <!-- Footer -->
    <div
      class="grid grid-cols-[auto_auto] items-center justify-center divide-x-2 divide-pink-400 p-1 *:px-3"
    >
      <span>Made with ❤️ by Steve Sajeev</span>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          href="https://www.linkedin.com/in/stevesajeev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedinIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          href="https://www.github.com/stevesajeev1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon />
        </Button>
      </div>
    </div>
  </div>
  <SvelteQueryDevtools initialIsOpen={false} />
</QueryClientProvider>

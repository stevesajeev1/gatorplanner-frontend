<script lang="ts">
  import logo from '$lib/assets/logo.png';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
  import Calendars from '@lucide/svelte/icons/calendars';
  import MoveRight from '@lucide/svelte/icons/move-right';
  import GraduationCap from '@lucide/svelte/icons/graduation-cap';
  import Construction from '@lucide/svelte/icons/construction';
  import { resolve } from '$app/paths';
  import { getCurrentTerm } from '$lib/utils/term';
</script>

<div class="h-full flex justify-center items-center">
  <div class="flex flex-col gap-10">
    <div>
      <div class="flex items-center justify-center gap-5">
        <img alt="logo" src={logo} class="size-32" />
        <h1 class="text-6xl font-bold">Plan your UF degree.</h1>
      </div>
      <p class="text-center">
        From your degree requirements to your weekly schedule, plan every semester with confidence.
      </p>
    </div>
    <div class="flex justify-center gap-10">
      <Card.Root class="w-100">
        <Card.Header>
          <Card.Title>
            <div class="flex items-center justify-center gap-3">
              <GraduationCap size={32} />
              <span class="text-3xl">Degree Planner</span>
            </div>
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <span class="text-center">Plan your entire degree.</span>
        </Card.Content>
        <Card.Footer class="flex justify-center">
          <div class="pointer-events-none {buttonVariants({ variant: 'outline' })}">
            <Construction />
            <span>Coming Soon</span>
          </div>
        </Card.Footer>
      </Card.Root>
      <Card.Root class="w-100">
        <Card.Header>
          <Card.Title>
            <div class="flex items-center justify-center gap-3">
              <Calendars size={32} />
              <span class="text-3xl">Semester Planner</span>
            </div>
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <span class="text-center">Build your schedule for a semester.</span>
        </Card.Content>
        <Card.Footer class="flex justify-center">
          <Button href={resolve('/semester/[term=terms]', { term: getCurrentTerm() })}>
            <span>Start Planning</span>
            <MoveRight />
          </Button>
        </Card.Footer>
      </Card.Root>
    </div>
    <div class="text-sm text-right">
      <span class="font-bold">Disclaimer:</span>
      <span>Not officially affiliated with UF.</span>
    </div>
  </div>
</div>
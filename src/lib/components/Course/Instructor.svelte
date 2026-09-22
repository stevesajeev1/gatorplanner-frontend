<script lang="ts">
  import type { CustomInstructor } from '$lib/api/models';
  import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';

  type Props = {
    instructor: CustomInstructor;
  };

  let { instructor }: Props = $props();

  const getColor = (value: number, min: number, max: number, reverse: boolean = false) => {
    let score = (value - min) / (max - min);
    if (reverse) {
      score = 1 - score;
    }

    if (score >= 0.85) return 'bg-green-600';
    if (score >= 0.75) return 'bg-lime-600';
    if (score >= 0.5) return 'bg-yellow-600';
    if (score >= 0.3) return 'bg-orange-600';
    return 'bg-red-600';
  };
</script>

<div>
  {#if instructor.rmp_id !== null}
    <Button
      class="ml-3 inline p-0"
      variant="link"
      aria-label="Rate My Professor"
      href="https://www.ratemyprofessors.com/professor/{instructor.rmp_id}"
      target="_blank"
      rel="noopener noreferrer"
    >
      {instructor.name}
    </Button>
    <Tooltip.Provider>
      {#if instructor.rating !== null}
        <Tooltip.Root>
          <Tooltip.Trigger
            ><Badge
              class="p-none rounded-full text-xs tabular-nums {getColor(instructor.rating, 1, 5)}"
              >{instructor.rating.toFixed(1)}</Badge
            ></Tooltip.Trigger
          >
          <Tooltip.Content>Rating</Tooltip.Content>
        </Tooltip.Root>
      {/if}
      {#if instructor.difficulty !== null}
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Badge
              class="rounded-full text-xs tabular-nums {getColor(
                instructor.difficulty!,
                1,
                5,
                true
              )}">{instructor.difficulty.toFixed(1)}</Badge
            >
          </Tooltip.Trigger>
          <Tooltip.Content>Difficulty</Tooltip.Content>
        </Tooltip.Root>
      {/if}
      {#if instructor.take_again !== null}
        <Tooltip.Root>
          <Tooltip.Trigger
            ><Badge
              class="rounded-full text-xs tabular-nums {getColor(instructor.take_again, 0, 100)}"
              >{instructor.take_again.toFixed(1)}</Badge
            ></Tooltip.Trigger
          >
          <Tooltip.Content>Take Again %</Tooltip.Content>
        </Tooltip.Root>
      {/if}
    </Tooltip.Provider>
  {:else}
    <span class="pointer-events-none inline! p-0 {buttonVariants({ variant: 'link' })}">{instructor.name}</span>
  {/if}
</div>

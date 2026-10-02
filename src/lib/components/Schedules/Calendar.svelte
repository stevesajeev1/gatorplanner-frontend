<script lang="ts">
  import { CustomMeetTimeDaysItem } from '$lib/api/models';
  import type { Term } from '$lib/utils/term';

  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Clock from '@lucide/svelte/icons/clock';
  import ClipboardCopy from '@lucide/svelte/icons/clipboard-copy';
  import Check from '@lucide/svelte/icons/check';

  import { formatDay } from '$lib/utils/day';
  import { formatTime } from '$lib/utils/time';
  import type { ScheduleClass } from './Calendar';
  import { getCourseHue } from '$lib/utils/hue';

  type Props = {
    term: Term;
    classes: ScheduleClass[];
    selected: boolean;
    onselect: () => void;
  };

  let { term, classes, selected, onselect }: Props = $props();

  let scrollArea = $state<HTMLElement | null>(null);

  const [onlineClasses, scheduleClasses] = $derived.by(() => {
    const onlineClasses: ScheduleClass[] = [];
    const scheduleClasses: ScheduleClass[] = [];

    for (const cls of classes) {
      if (cls.class.meet_times.length === 0) {
        // Class is online
        onlineClasses.push(cls);
      } else {
        scheduleClasses.push(cls);
      }
    }
    return [onlineClasses, scheduleClasses];
  });

  const REGULAR_PERIODS = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    'E1',
    'E2',
    'E3'
  ];
  const SUMMER_PERIODS = ['1', '2', '3', '4', '5', '6', '7', 'E1', 'E2', 'E3'];

  const getDayColumn = (day: string) => {
    return Object.keys(CustomMeetTimeDaysItem).findIndex((d) => d === day) + 2;
  };

  const getPeriodRow = (period: string) => {
    return (
      (term === 'Summer' ? SUMMER_PERIODS : REGULAR_PERIODS).findIndex((p) => p === period) + 2
    );
  };

  let copied = $state(false);

  async function copyClassNumber(number: number) {
    await navigator.clipboard.writeText(String(number));

    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1000);
  }

  const firstClassPeriod = $derived.by(() => {
    let earliest: string | null = null;

    for (const cls of scheduleClasses) {
      for (const cmt of cls.class.meet_times) {
        if (earliest === null || getPeriodRow(cmt.period_start) < getPeriodRow(earliest)) {
          earliest = cmt.period_start;
        }
      }
    }

    return earliest;
  });

  const scrollToFirstClass = () => {
    if (!scrollArea) return;

    const element = scrollArea.querySelector('[data-first-class]');
    if (!element) return;

    const viewportRect = scrollArea.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    scrollArea.scrollTo({
      top: scrollArea.scrollTop + elementRect.top - viewportRect.top - 32
    });
  };

  $effect(() => {
    classes; // eslint-disable-line @typescript-eslint/no-unused-expressions

    requestAnimationFrame(scrollToFirstClass);
  });
</script>

<div>
  <ScrollArea bind:viewportRef={scrollArea} class="h-80" orientation="both" scrollHideDelay={10}>
    <div
      class="grid min-w-260 grid-cols-[auto_repeat(7,minmax(0,1fr))] {term === 'Summer'
        ? 'grid-rows-[auto_repeat(9,minmax(0,1fr))]'
        : 'grid-rows-[auto_repeat(14,minmax(0,1fr))]'}"
    >
      <!-- Header -->
      <span class="col-start-1 row-start-1 bg-gray-100"></span>
      {#each Object.keys(CustomMeetTimeDaysItem) as day, i (i)}
        <div class="row-span-full col-start-{i + 2} border-l border-dashed border-l-gray-300"></div>
        <span
          class="sticky top-0 row-start-1 col-start-{i +
            2} border-l border-dashed border-l-gray-300 bg-gray-100 text-center"
          >{formatDay(day).toUpperCase().substring(0, 3)}</span
        >
      {/each}
      <!-- Period Labels -->
      {#each term === 'Summer' ? SUMMER_PERIODS : REGULAR_PERIODS as period, i (i)}
        <div class="h-16 row-start-{i + 2} col-span-full border-t border-t-gray-300"></div>
        <span
          class="sticky left-0 row-start-{i +
            2} col-start-1 border-t border-t-gray-300 bg-gray-100 text-center">{period}</span
        >
      {/each}
      <!-- Classes -->
      {#each scheduleClasses as cls (cls.course.id)}
        {@const hue = getCourseHue(cls.course.id)}
        {#each cls.class.meet_times as cmt, i (i)}
          {@const isFirstClass = cmt.period_start === firstClassPeriod}
          {@const building = cmt.building}
          {#each cmt.days as day, i (i)}
            <div
              data-first-class={isFirstClass ? '' : undefined}
              class="pl-1 row-start-{getPeriodRow(cmt.period_start)} row-end-{getPeriodRow(
                cmt.period_end
              ) + 1} col-start-{getDayColumn(
                day
              )} border-l-4 border-l-[hsl(var(--hue)_100%_60%)] bg-[hsl(var(--hue)_100%_90%)]"
              style={`--hue: ${hue}`}
            >
              <Popover.Root>
                <Popover.Trigger class="flex h-full w-full cursor-pointer">
                  <div class="flex flex-col text-start">
                    <span class="font-bold">{cls.course.code}</span>
                    <span class="font-light"
                      >{formatTime(cmt.time_start)} - {formatTime(cmt.time_end)}</span
                    >
                    {#if building !== null}
                      <div class="flex items-center gap-0.5">
                        <MapPin size={14} />
                        {#if building.room === null}
                          <span>{building.code}</span>
                        {:else}
                          <span>{building.name} {building.room}</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </Popover.Trigger>
                <Popover.Content>
                  <div class="flex flex-col gap-1">
                    <span class="font-bold">{cls.course.code} - {cls.course.name}</span>
                    <div class="flex items-center gap-1">
                      <span class="underline decoration-dotted">Class #{cls.class.number}</span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="Copy"
                        onclick={() => {
                          copyClassNumber(cls.class.number);
                        }}
                      >
                        {#if copied}
                          <Check />
                        {:else}
                          <ClipboardCopy />
                        {/if}
                      </Button>
                    </div>
                    <div class="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatTime(cmt.time_start)} - {formatTime(cmt.time_end)}</span>
                    </div>
                    {#if building !== null}
                      <div class="flex items-center gap-0.5">
                        <MapPin size={14} />
                        {#if building.room === null}
                          <span>{building.code}</span>
                        {:else}
                          <span>{building.name} {building.room}</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </Popover.Content>
              </Popover.Root>
            </div>
          {/each}
        {/each}
      {/each}
    </div>
  </ScrollArea>
  {#if onlineClasses.length > 0}
    <span class="font-bold text-blue-500"
      >{onlineClasses.map((cls) => `${cls.course.code} (#${cls.class.number})`).join(', ')}
      {onlineClasses.length === 1 ? 'is' : 'are'} online</span
    >
  {/if}
  <div class="flex justify-end">
    <Button variant={selected ? 'destructive' : 'outline'} size="sm" onclick={onselect}
      >{selected ? 'Deselect' : 'Select'}</Button
    >
  </div>
</div>

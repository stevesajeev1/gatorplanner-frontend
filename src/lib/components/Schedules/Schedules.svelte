<script lang="ts">
  import type { Schedule } from '$lib/api/models/schedule';

  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Separator } from '$lib/components/ui/separator';
  import VirtualList from '@humanspeak/svelte-virtual-list';
  import type { SelectedClass } from '../Course/SelectedClass';
  import Calendar from './Calendar.svelte';
  import {
    GenerateSchedulesRequestDayRestrictionsItem,
    GenerateSchedulesRequestSortBy,
    type GenerateSchedulesRequest
  } from '$lib/api/models';
  import { createGenerateSchedulesInfinite } from '$lib/api/endpoints';
  import { parseTermNumber } from '$lib/utils/term';
  import type { ScheduleClass, SelectedSchedule } from './Calendar';
  import { formatDay } from '$lib/utils/day';

  type Props = {
    term: number;
    selectedClasses: SelectedClass[];
    selectedSchedule: SelectedSchedule | null;
  };

  let { term, selectedClasses, selectedSchedule = $bindable() }: Props = $props();

  let sortBy = $state<GenerateSchedulesRequestSortBy | null>(null);
  let dayRestrictions = $state<GenerateSchedulesRequestDayRestrictionsItem[]>([]);

  const schedulesRequest = $derived<GenerateSchedulesRequest | null>(
    selectedClasses.length > 0
      ? {
          class_choices: selectedClasses.map((c: SelectedClass) => ({
            course_id: c.course.id,
            class_ids: c.classes.map((cl) => cl.id)
          })),
          sort_by: sortBy ?? undefined,
          day_restrictions: dayRestrictions
        }
      : null
  );
  const schedules = createGenerateSchedulesInfinite(
    () => term,
    () => schedulesRequest ?? { class_choices: [] },
    undefined,
    () => ({
      query: {
        enabled: schedulesRequest !== null
      }
    })
  );

  const fetchNextPage = async () => {
    if (!schedules.hasNextPage || schedules.isFetchingNextPage) return;

    await schedules.fetchNextPage();
  };

  const sortByOptions: Record<GenerateSchedulesRequestSortBy, string> = {
    [GenerateSchedulesRequestSortBy.earliest_start]: 'Earliest Start',
    [GenerateSchedulesRequestSortBy.latest_start]: 'Latest Start',
    [GenerateSchedulesRequestSortBy.earliest_end]: 'Earliest End',
    [GenerateSchedulesRequestSortBy.latest_end]: 'Latest End',
    [GenerateSchedulesRequestSortBy.most_compact]: 'Most Compact',
    [GenerateSchedulesRequestSortBy.fewest_days]: 'Fewest Days',
    [GenerateSchedulesRequestSortBy.most_balanced]: 'Most Balanced',
    [GenerateSchedulesRequestSortBy.instructor_rating]: 'Instructor Rating'
  };

  const constructScheduleClasses = (schedule: Schedule): ScheduleClass[] => {
    const scheduleClasses: ScheduleClass[] = [];
    for (const cls of schedule.classes) {
      const matchingSelectedClass = selectedClasses.find((c) => c.course.id === cls.course_id);
      if (matchingSelectedClass === undefined) continue;

      const scheduleCourse = matchingSelectedClass.course;
      const scheduleClass = matchingSelectedClass.classes.find((c) => c.id === cls.class_id);

      // Theoretically should not occur, but because of state update-order there's a potential for
      // classes to be updated with new value while schedule retains stale value
      if (scheduleClass === undefined) continue;

      scheduleClasses.push({
        course: scheduleCourse,
        class: scheduleClass
      });
    }
    return scheduleClasses;
  };

  const isSelected = (s: Schedule): boolean => {
    if (selectedSchedule === null) return false;
    if (s.classes.length !== selectedSchedule.classes.length) return false;

    const map = new Map(selectedSchedule.classes.map((cl) => [cl.course.id, cl.class.id]));

    return s.classes.every((cl) => map.get(cl.course_id) === cl.class_id);
  };

  const scheduleItems = $derived.by(() => {
    const items = schedules.data?.pages.flatMap((page) => page.items) ?? [];
    return items.filter((s) => !isSelected(s)).map(constructScheduleClasses);
  });

  const deselectSchedule = () => {
    selectedSchedule = null;
  };

  const selectSchedule = (schedule: ScheduleClass[]) => {
    selectedSchedule = {
      classes: [...schedule]
    };
  };
</script>

<div class="flex h-full flex-col">
  <!-- Options -->
  <div class="flex gap-2 p-2">
    <div class="grow-4">
      <Select.Root
        type="single"
        allowDeselect={true}
        bind:value={
          () => sortBy ?? undefined,
          (v: GenerateSchedulesRequestSortBy | '' | undefined) => {
            sortBy = v === '' || v === undefined ? null : v;
          }
        }
      >
        <Select.Trigger class="w-full">
          {#if sortBy === null}
            <span class="text-muted-foreground">Sort By</span>
          {:else}
            {sortByOptions[sortBy]}
          {/if}
        </Select.Trigger>

        <Select.Content>
          {#each Object.entries(sortByOptions) as option, i (i)}
            {@const [value, display] = option}
            <Select.Item {value}>{display}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    <div class="grow">
      <Select.Root type="multiple" bind:value={dayRestrictions}>
        <Select.Trigger class="w-full">
          {#if dayRestrictions.length === 0}
            <span class="text-muted-foreground">Avoid</span>
          {:else}
            <span class="truncate">{dayRestrictions.join(', ')}</span>
          {/if}
        </Select.Trigger>

        <Select.Content>
          {#each Object.values(GenerateSchedulesRequestDayRestrictionsItem) as option, i (i)}
            <Select.Item value={option}>{formatDay(option)}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
  </div>
  <!-- Selected -->
  {#if selectedSchedule !== null}
    <div class="border-6 border-gray-400 p-2">
      <span class="text-lg font-bold">Selected Schedule</span>
      <Calendar
        term={parseTermNumber(term)}
        classes={selectedSchedule.classes}
        selected={true}
        onselect={deselectSchedule}
      />
    </div>
  {/if}
  <!-- List -->
  {#if selectedClasses.length === 0}
    <span class="p-3">No classes currently selected.</span>
  {:else if schedules.isLoading}
    <div class="flex items-center gap-2 p-3">
      <Spinner class="size-3" />
      <span class="animate-pulse">Generating Schedules...</span>
    </div>
  {:else if schedules.isError}
    <span class="p-3 text-red-500"
      >An error occurred when trying to generate schedules. Please try again later.</span
    >
  {:else if scheduleItems.length === 0}
    {#if selectedSchedule !== null}
      <span class="p-3">No more possible schedules found.</span>
    {:else}
      <span class="p-3">No possible schedules found.</span>
    {/if}
  {:else}
    <div class="min-h-0 grow">
      <VirtualList items={scheduleItems} onLoadMore={fetchNextPage} hasMore={schedules.hasNextPage}>
        {#snippet renderItem(item, idx)}
          {#if idx !== 0}
            <Separator />
          {/if}
          <div class="p-4">
            <Calendar
              term={parseTermNumber(term)}
              classes={item}
              selected={false}
              onselect={() => selectSchedule(item)}
            />
          </div>
        {/snippet}
      </VirtualList>
    </div>
  {/if}
</div>

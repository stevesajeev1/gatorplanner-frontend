<script lang="ts">
  import Funnel from '@lucide/svelte/icons/funnel';
  import Search from '@lucide/svelte/icons/search';
  import Loader from '@lucide/svelte/icons/loader-circle';

  import { Button } from '$lib/components/ui/button/index.js';
  import * as InputGroup from '$lib/components/ui/input-group/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import { getTermDisplay } from '$lib/utils/term';

  import type { PageProps } from './$types';

  import FilterBuilder from '$lib/components/FilterBuilder/FilterBuilder.svelte';
  import type { Field, Options } from '$lib/components/FilterBuilder/FilterBuilder';
  import Course from '$lib/components/Course/Course.svelte';

  import {
    FilterRuleNumberPeriodValue,
    FilterRuleTextClassMeetTypeValue,
    FilterRuleTextCourseGenEdsValue,
    FilterRuleTextCourseMeetDaysValue,
    FilterRuleTextCourseQuestValue,
    type SearchClassesRequest,
    type TypedListClassesByIDRow,
    type TypedListCoursesByIDRow
  } from '$lib/api/models';

  import {
    createListBuildings,
    createListDepartments,
    createSearchClassesInfinite
  } from '$lib/api/endpoints';
  import { keepPreviousData } from '@tanstack/svelte-query';
  import type { SelectedClass as SelectedClassType } from '$lib/components/Course/SelectedClass';
  import SelectedClass from '$lib/components/Course/SelectedClass.svelte';
  import { formatDay } from '$lib/utils/day';
  import { watch } from '$lib/utils/watch.svelte';
  import { onMount, tick } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { PersistedArray, PersistedMap, PersistedObject } from '$lib/utils/persist.svelte';
  import Schedules from '$lib/components/Schedules/Schedules.svelte';
  import type { SelectedSchedule } from '$lib/components/Schedules/Calendar';

  let { params }: PageProps = $props();

  let classesRequest = $state<SearchClassesRequest | null>(null);

  let filterEnabled = $state(true);
  let search = $state('');

  let filterBuilder = $state<FilterBuilder<typeof fields>>();

  let scrollArea = $state<HTMLElement | null>(null);

  const fields = [
    { id: 'meet_type', label: 'Meet Type', type: 'text' },
    { id: 'course_gen_eds', label: 'Gen Ed', type: 'text' },
    { id: 'course_quest', label: 'Quest', type: 'text' },
    { id: 'meet_times.days', label: 'Day', type: 'text' },
    { id: 'course_code', label: 'Code', type: 'text' },
    { id: 'course_code_prefix', label: 'Code Prefix', type: 'text' },
    { id: 'course_name', label: 'Name', type: 'text' },
    { id: 'course_department', label: 'Department', type: 'text' },
    { id: 'meet_times.building', label: 'Building', type: 'text' },
    { id: 'instructors.name', label: 'Instructor Name', type: 'text' },
    { id: 'meet_times.period_start', label: 'Period Start', type: 'number' },
    { id: 'meet_times.period_end', label: 'Period End', type: 'number' },
    { id: 'number', label: 'Number', type: 'number' },
    { id: 'course_level', label: 'Level', type: 'number' },
    { id: 'course_credits', label: 'Credits', type: 'number' },
    { id: 'course_words', label: 'Words', type: 'number' },
    { id: 'instructors.rating', label: 'Instructor Rating', type: 'number' },
    { id: 'instructors.difficulty', label: 'Instructor Difficulty', type: 'number' },
    { id: 'instructors.take_again', label: 'Instructor Retake %', type: 'number' },
    { id: 'meet_times.time_start', label: 'Start Time', type: 'time' },
    { id: 'meet_times.time_end', label: 'End Time', type: 'time' },
    { id: 'course_is_lab', label: 'Lab', type: 'boolean' },
    { id: 'course_is_ai', label: 'AI', type: 'boolean' },
    { id: 'course_is_honors', label: 'Honors', type: 'boolean' }
  ] as const satisfies readonly Field[];

  // Fetch building and department options
  const buildings = createListBuildings();
  const departments = createListDepartments();

  const options = $derived({
    meet_type: Object.values(FilterRuleTextClassMeetTypeValue).map((value) => ({
      value
    })),

    course_gen_eds: Object.values(FilterRuleTextCourseGenEdsValue).map((value) => ({
      value
    })),

    course_quest: Object.values(FilterRuleTextCourseQuestValue).map((value) => ({
      value
    })),

    'meet_times.days': Object.values(FilterRuleTextCourseMeetDaysValue).map((value) => ({
      label: formatDay(value),
      value
    })),

    'meet_times.period_start': Object.values(FilterRuleNumberPeriodValue).map((value) => ({
      value
    })),

    'meet_times.period_end': Object.values(FilterRuleNumberPeriodValue).map((value) => ({
      value
    })),

    'meet_times.building': buildings.isSuccess
      ? buildings.data.map((b) => ({ value: b.name }))
      : [],

    course_department: departments.isSuccess ? departments.data.map((value) => ({ value })) : []
  }) satisfies Options<typeof fields>;

  const classes = createSearchClassesInfinite(
    () => parseInt(params.term),
    () => classesRequest ?? {},
    undefined,
    () => ({
      query: {
        enabled: classesRequest !== null,
        placeholderData: keepPreviousData
      }
    })
  );
  const classesLoading = $derived(classes.isFetching);
  const classItems = $derived(classes.data?.pages.flatMap((page) => page.items) ?? []);

  const searchClasses = () => {
    const nextRequest: SearchClassesRequest = {};

    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
      nextRequest.search = trimmedSearch;
    }

    if (filterEnabled) {
      const filter = filterBuilder!.getFilter();

      if (filter !== null) {
        nextRequest.filter = filter;
      }
    }

    if (nextRequest.search === undefined && nextRequest.filter === undefined) return;

    classesRequest = nextRequest;
  };

  const maybeFetchNextPage = async () => {
    if (scrollArea === null) return;
    if (!classes.hasNextPage || classes.isFetchingNextPage) return;

    const remaining = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight;

    if (remaining <= 200) {
      await classes.fetchNextPage();

      await tick();
      maybeFetchNextPage();
    }
  };

  onMount(() => {
    if (scrollArea === null) return;

    const resizeObserver = new ResizeObserver(maybeFetchNextPage);
    resizeObserver.observe(scrollArea);
    return () => resizeObserver.disconnect();
  });

  const term = () => params.term;
  const _selectedClasses = new PersistedMap<
    TypedListCoursesByIDRow['id'],
    SvelteSet<TypedListClassesByIDRow['id']>,
    TypedListClassesByIDRow['id'][]
  >(
    `${term()}-selected-class-ids`,
    (classes) => [...classes],
    (classes) => new SvelteSet(classes)
  );
  const selectedClasses = new PersistedArray<SelectedClassType>(`${term()}-selected-classes`);
  const selectedSchedule = new PersistedObject<SelectedSchedule>(`${term()}-selected-schedule`);

  watch(
    () => _selectedClasses.value,
    (prev, curr) => {
      if (curr.size > prev.size) {
        const newCourse = [...curr.keys()].find((k) => !prev.has(k))!;
        const newClasses = curr.get(newCourse)!;

        const item = classItems.find((item) => item.course.id === newCourse)!;
        const classMap = new Map(item.classes.map((c) => [c.id, c]));

        const selectedClass: SelectedClassType = {
          course: item.course,
          classes: Array.from(newClasses, (id) => classMap.get(id)!).toSorted(
            (a, b) => a.number - b.number
          )
        };
        selectedClasses.push(selectedClass);
      } else if (curr.size < prev.size) {
        const removedCourse = [...prev.keys()].find((k) => !curr.has(k))!;

        selectedClasses.replace(selectedClasses.filter((c) => c.course.id !== removedCourse));
      } else {
        const updatedCourse = [...curr.keys()].find(
          (k) => prev.get(k)!.size !== curr.get(k)!.size
        )!;

        const prevClasses = prev.get(updatedCourse)!;
        const currClasses = curr.get(updatedCourse)!;
        const course = selectedClasses.find((c) => c.course.id === updatedCourse)!;

        if (currClasses.size < prevClasses.size) {
          // removal, no need to lookup in classItems
          course.classes = [...course.classes.filter((cl) => currClasses.has(cl.id))];
        } else {
          // lookup added class information in classItems
          const addedClasses = currClasses.difference(prevClasses);

          const item = classItems.find((item) => item.course.id === updatedCourse)!;
          const classMap = new Map(item.classes.map((c) => [c.id, c]));

          course.classes = [
            ...course.classes,
            ...Array.from(addedClasses, (id) => classMap.get(id)!)
          ].toSorted((a, b) => a.number - b.number);
        }
      }
    },
    false
  );

  const handleClassSelect = (
    courseId: TypedListCoursesByIDRow['id'],
    selectedSections: SvelteSet<TypedListClassesByIDRow['id']>
  ) => {
    if (selectedSections.size === 0) {
      _selectedClasses.delete(courseId);
    } else {
      _selectedClasses.set(courseId, selectedSections);
    }
  };

  const totalCredits = $derived(
    selectedClasses.reduce(
      (total, c) => ({
        min: total.min + c.course.credits_min,
        max: total.max + c.course.credits_max
      }),
      { min: 0, max: 0 }
    )
  );

  const handleClassRemove = (courseCode: TypedListCoursesByIDRow['id']) => {
    _selectedClasses.delete(courseCode);
  };
</script>

<div class="flex h-full flex-col gap-2 p-3">
  <h1 class="mb-1 text-xl font-bold">{getTermDisplay(params.term)}</h1>

  <div class="grid h-full min-h-0 grid-cols-12 divide-x-2 divide-gray-200 *:px-3">
    <div class="col-span-2 flex flex-col overflow-hidden">
      <h2 class="mb-2 text-lg font-semibold">Selected Classes</h2>
      <ScrollArea class="min-h-0 grow" scrollHideDelay={10}>
        <div class="flex flex-col gap-2 pr-3">
          {#each selectedClasses.value as selectedClass (selectedClass.course.id)}
            <SelectedClass
              class={selectedClass}
              ondelete={() => handleClassRemove(selectedClass.course.id)}
            />
          {:else}
            <span class="text-sm font-light">No classes currently selected.</span>
          {/each}
        </div>
      </ScrollArea>
      <div class="mt-1 mr-3 flex justify-end gap-1">
        <span class="font-semibold">Credits:</span>
        {#if totalCredits.min === totalCredits.max}
          <span>{totalCredits.min}</span>
        {:else}
          <span>{totalCredits.min}-{totalCredits.max}</span>
        {/if}
      </div>
    </div>
    <div class="col-span-4 flex min-h-0 flex-col gap-2">
      <h2 class="text-lg font-semibold">Available Classes</h2>
      <div class="flex items-center gap-2">
        <InputGroup.Root class="flex-1" data-disabled={classesLoading}>
          <InputGroup.Input
            placeholder="Search classes (ENC1102, Programming, Schwartz, Carleton, etc.)"
            bind:value={search}
            disabled={classesLoading}
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                searchClasses();
              }
            }}
          />
          <InputGroup.Addon align="inline-end">
            {#if classesLoading}
              <Loader class="animate-spin" />
            {/if}
          </InputGroup.Addon>
        </InputGroup.Root>

        <Button
          variant={filterEnabled ? 'default' : 'outline'}
          size="icon"
          aria-label="Filter"
          onclick={() => (filterEnabled = !filterEnabled)}
          disabled={classesLoading}
        >
          <Funnel />
        </Button>

        <Button
          variant="outline"
          size="icon"
          aria-label="Search"
          disabled={classesLoading}
          onclick={searchClasses}
        >
          <Search />
        </Button>
      </div>

      <FilterBuilder
        bind:this={filterBuilder}
        class="shrink-0"
        {fields}
        {options}
        hidden={filterEnabled}
        disabled={classesLoading}
      />

      {#if classes.isError}
        <span class="text-sm text-red-500"
          >An error occurred when trying to fetch classes. Please try again later.</span
        >
      {:else}
        <ScrollArea
          bind:viewportRef={scrollArea}
          class="min-h-0 grow rounded-md border"
          scrollHideDelay={10}
          onscrollcapture={maybeFetchNextPage}
        >
          <div class="flex flex-col gap-2 px-4 py-2">
            {#if classes.data === undefined}
              <h4 class="text-sm font-medium">Please input a search query.</h4>
            {:else}
              {#each classItems as item (item.course.id)}
                <Course
                  course={item.course}
                  sections={item.classes}
                  bind:selectedSections={
                    () => _selectedClasses.value.get(item.course.id) ?? new SvelteSet(),
                    (selectedSections: SvelteSet<TypedListClassesByIDRow['id']>) =>
                      handleClassSelect(item.course.id, selectedSections)
                  }
                />
              {:else}
                <span class="text-sm font-medium">No classes found matching this search query.</span
                >
              {/each}
            {/if}
          </div>
        </ScrollArea>
      {/if}
    </div>
    <div class="col-span-6 min-h-0">
      <Tabs.Root class="h-full" value="schedules">
        <Tabs.List>
          <Tabs.Trigger value="schedules">Schedules</Tabs.Trigger>
          <Tabs.Trigger value="map">Map</Tabs.Trigger>
        </Tabs.List>
        <div class="h-full overflow-hidden rounded-md border *:h-full">
          <Tabs.Content value="schedules">
            <Schedules
              term={parseInt(params.term)}
              selectedClasses={selectedClasses.value}
              bind:selectedSchedule={
                () => selectedSchedule.value,
                (schedule: SelectedSchedule | null) => selectedSchedule.set(schedule)
              }
            />
          </Tabs.Content>
          <Tabs.Content value="map">MAP</Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  </div>
</div>

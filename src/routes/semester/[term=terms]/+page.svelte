<script lang="ts">
  import Funnel from '@lucide/svelte/icons/funnel';
  import Search from '@lucide/svelte/icons/search';
  import Loader from '@lucide/svelte/icons/loader-circle';

  import { Button } from '$lib/components/ui/button/index.js';
  import * as InputGroup from '$lib/components/ui/input-group/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { getTerm } from '$lib/utils/term';

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
  import type {
    _SelectedClasses,
    SelectedClass as SelectedClassType
  } from '$lib/components/Course/SelectedClass';
  import SelectedClass from '$lib/components/Course/SelectedClass.svelte';
  import { formatDay } from '$lib/utils/day';
  import { watch } from '$lib/utils/watch.svelte';
  import { onMount, tick } from 'svelte';
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  let { params }: PageProps = $props();

  let request = $state<SearchClassesRequest | null>(null);

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

    'meet_times.building': buildings.isSuccess ? buildings.data.map((value) => ({ value })) : [],

    course_department: departments.isSuccess ? departments.data.map((value) => ({ value })) : []
  }) satisfies Options<typeof fields>;

  const classes = createSearchClassesInfinite(
    () => parseInt(params.term),
    () => request ?? {},
    undefined,
    () => ({
      query: {
        enabled: request !== null,
        placeholderData: keepPreviousData
      }
    })
  );

  const loading = $derived(classes.isFetching);

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

    request = nextRequest;
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

  const items = $derived(classes.data?.pages.flatMap((page) => page.items) ?? []);

  let _selectedClasses: _SelectedClasses = new SvelteMap();
  let selectedClasses = $state<SelectedClassType[]>([]);

  watch(
    () => _selectedClasses,
    (prev, curr) => {
      if (curr.size > prev.size) {
        const newCourse = [...curr.keys()].find((k) => !prev.has(k))!;

        const item = items.find((item) => item.course.code === newCourse)!;
        const classes = curr.get(newCourse)!;

        const selectedClass: SelectedClassType = {
          course: {
            code: item.course.code,
            name: item.course.name,
            credits_min: item.course.credits_min,
            credits_max: item.course.credits_max
          },
          classes: Array.from(classes, (number) => ({ number })).toSorted()
        };
        selectedClasses = [...selectedClasses, selectedClass];
      } else if (curr.size < prev.size) {
        const removedCourse = [...prev.keys()].find((k) => !curr.has(k))!;

        selectedClasses = [...selectedClasses.filter((c) => c.course.code !== removedCourse)];
      } else {
        const [updatedCourse, updatedClasses] = [...curr.entries()].find(
          ([code, classes]) => prev.get(code)!.size !== classes.size
        )!;

        const course = selectedClasses.find((c) => c.course.code === updatedCourse)!;
        course.classes = Array.from(updatedClasses, (number) => ({ number })).toSorted();
      }
    },
    false
  );

  const handleClassSelect = (
    courseCode: TypedListCoursesByIDRow['code'],
    selectedSections: SvelteSet<TypedListClassesByIDRow['number']>
  ) => {
    const next = new SvelteMap(_selectedClasses);
    if (selectedSections.size === 0) {
      next.delete(courseCode);
    } else {
      next.set(courseCode, selectedSections);
    }
    _selectedClasses = next;
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

  const handleClassRemove = (courseCode: TypedListCoursesByIDRow['code']) => {
    const next = new SvelteMap(_selectedClasses);
    next.delete(courseCode);
    _selectedClasses = next;
  };
</script>

<div class="flex h-full flex-col gap-2 p-3">
  <h1 class="mb-1 text-xl font-bold">{getTerm(params.term)}</h1>

  <div class="grid h-full min-h-0 grid-cols-12 divide-x-2 divide-gray-200 *:px-3">
    <div class="col-span-2 flex flex-col overflow-hidden">
      <h2 class="mb-2 text-lg font-semibold">Selected Classes</h2>
      <ScrollArea class="min-h-0 grow" scrollHideDelay={10}>
        <div class="flex flex-col gap-2 pr-3">
          {#each selectedClasses as selectedClass (selectedClass.course.code)}
            <SelectedClass
              class={selectedClass}
              ondelete={() => handleClassRemove(selectedClass.course.code)}
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
        <InputGroup.Root class="flex-1" data-disabled={loading}>
          <InputGroup.Input
            placeholder="Search classes (ENC1102, Programming, Schwartz, Carleton, etc.)"
            bind:value={search}
            disabled={loading}
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                searchClasses();
              }
            }}
          />
          <InputGroup.Addon align="inline-end">
            {#if loading}
              <Loader class="animate-spin" />
            {/if}
          </InputGroup.Addon>
        </InputGroup.Root>

        <Button
          variant={filterEnabled ? 'default' : 'outline'}
          size="icon"
          aria-label="Filter"
          onclick={() => (filterEnabled = !filterEnabled)}
          disabled={loading}
        >
          <Funnel />
        </Button>

        <Button
          variant="outline"
          size="icon"
          aria-label="Search"
          disabled={loading}
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
        disabled={loading}
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
              {#each items as item (item.course.code)}
                <Course
                  course={item.course}
                  sections={item.classes}
                  bind:selectedSections={
                    () => _selectedClasses.get(item.course.code) ?? new SvelteSet(),
                    (selectedSections: SvelteSet<TypedListClassesByIDRow['number']>) =>
                      handleClassSelect(item.course.code, selectedSections)
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
    <div class="col-span-4"></div>
  </div>
</div>

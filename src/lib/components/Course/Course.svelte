<script lang="ts">
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import { Separator } from '$lib/components/ui/separator';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import Book from '@lucide/svelte/icons/book';
  import FlaskConical from '@lucide/svelte/icons/flask-conical';
  import Brain from '@lucide/svelte/icons/brain';
  import BookOpenText from '@lucide/svelte/icons/book-open-text';
  import Telescope from '@lucide/svelte/icons/telescope';
  import BookType from '@lucide/svelte/icons/book-type';
  import LetterUppercaseCircleBIcon from '@iconify-svelte/arcticons/letter-uppercase-circle-b';
  import LetterUppercaseCirclePIcon from '@iconify-svelte/arcticons/letter-uppercase-circle-p';
  import LetterUppercaseCircleSIcon from '@iconify-svelte/arcticons/letter-uppercase-circle-s';
  import LetterUppercaseCircleMIcon from '@iconify-svelte/arcticons/letter-uppercase-circle-m';
  import LetterUppercaseCircleCIcon from '@iconify-svelte/arcticons/letter-uppercase-circle-c';
  import LetterUppercaseCircleHIcon from '@iconify-svelte/arcticons/letter-uppercase-circle-h';
  import LetterUppercaseCircleIIcon from '@iconify-svelte/arcticons/letter-uppercase-circle-i';
  import type { TypedListClassesByIDRow, TypedListCoursesByIDRow } from '$lib/api/models';
  import Section from './Section.svelte';
  import { SvelteSet } from 'svelte/reactivity';

  type Props = {
    course: TypedListCoursesByIDRow;
    sections: TypedListClassesByIDRow[];
    selectedSections: SvelteSet<TypedListClassesByIDRow['number']>;
  };

  let { course, sections, selectedSections = $bindable() }: Props = $props();

  const gen_eds = {
    'Biological Science': {
      icon: LetterUppercaseCircleBIcon,
      color: 'text-green-500'
    },
    'Physical Science': {
      icon: LetterUppercaseCirclePIcon,
      color: 'text-blue-500'
    },
    'Social Science': {
      icon: LetterUppercaseCircleSIcon,
      color: 'text-purple-500'
    },
    Mathematics: {
      icon: LetterUppercaseCircleMIcon,
      color: 'text-orange-500'
    },
    Composition: {
      icon: LetterUppercaseCircleCIcon,
      color: 'text-red-500'
    },
    Humanities: {
      icon: LetterUppercaseCircleHIcon,
      color: 'text-yellow-500'
    },
    International: {
      icon: LetterUppercaseCircleIIcon,
      color: 'text-pink-500'
    }
  } as const;

  const handleClassSelect = (selected: boolean) => {
    const next = new SvelteSet(selectedSections);
    if (selected) {
      sections.forEach((section) => next.add(section.number));
    } else {
      next.clear();
    }
    selectedSections = next;
  };

  const handleSectionSelect = (
    sectionNumber: TypedListClassesByIDRow['number'],
    selected: boolean
  ) => {
    const next = new SvelteSet(selectedSections);
    if (selected) {
      next.add(sectionNumber);
    } else {
      next.delete(sectionNumber);
    }
    selectedSections = next;
  };
</script>

<Collapsible.Root class="rounded-md bg-gray-100 p-2">
  <Collapsible.Trigger class="grid w-full grid-cols-[1fr_auto]">
    <div class="flex flex-col items-start overflow-hidden">
      <div class="flex items-center gap-1">
        <span class="font-bold">{course.code}</span>
        <Tooltip.Provider>
          {#if course.is_lab}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <FlaskConical class="text-green-500" size={14} />
              </Tooltip.Trigger>
              <Tooltip.Content>Lab</Tooltip.Content>
            </Tooltip.Root>
          {/if}
          {#if course.is_ai}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Brain class="text-pink-500" size={14} />
              </Tooltip.Trigger>
              <Tooltip.Content>AI</Tooltip.Content>
            </Tooltip.Root>
          {/if}
          {#if course.is_honors}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <BookOpenText class="text-indigo-500" size={14} />
              </Tooltip.Trigger>
              <Tooltip.Content>Honors</Tooltip.Content>
            </Tooltip.Root>
          {/if}
          {#if course.quest !== null}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Telescope class="text-violet-500" size={14} />
              </Tooltip.Trigger>
              <Tooltip.Content>{course.quest}</Tooltip.Content>
            </Tooltip.Root>
          {/if}
          {#if course.words > 0}
            <Tooltip.Root>
              <Tooltip.Trigger>
                <BookType class="text-red-500" size={14} />
              </Tooltip.Trigger>
              <Tooltip.Content>{course.words} words</Tooltip.Content>
            </Tooltip.Root>
          {/if}
          {#each course.gen_eds as gen_ed, i (i)}
            <Tooltip.Root>
              <Tooltip.Trigger>
                {@const { icon: Icon, color } = gen_eds[gen_ed as keyof typeof gen_eds]}
                <Icon class={`${color} size-4.5 stroke-4`} />
              </Tooltip.Trigger>
              <Tooltip.Content>{gen_ed}</Tooltip.Content>
            </Tooltip.Root>
          {/each}
        </Tooltip.Provider>
      </div>
      <span class="max-w-full truncate">{course.name}</span>
    </div>
    <div class="flex flex-col items-end gap-2">
      <Checkbox
        class="border-gray-400"
        onclick={(e) => e.stopPropagation()}
        bind:checked={
          () => selectedSections.size === sections.length,
          (selected: boolean) => handleClassSelect(selected)
        }
        bind:indeterminate={
          () => selectedSections.size > 0 && selectedSections.size < sections.length, () => {}
        }
      />
      <div class="text-sm font-light">
        <span>Credits:</span>
        {#if course.credits_min === course.credits_max}
          <span>{course.credits_min}</span>
        {:else}
          <span>{course.credits_min}-{course.credits_max}</span>
        {/if}
      </div>
    </div>
  </Collapsible.Trigger>
  <Collapsible.Content>
    <Separator class="my-2" />
    <div class="flex flex-col gap-2">
      <div class="text-sm">
        <span class="font-bold">Description:</span>
        <span>{course.description}</span>
      </div>
      <div class="-my-2 flex">
        <Button
          class="flex items-center p-0 text-blue-500"
          variant="link"
          aria-label="Syllabus"
          href="https://ufl.simplesyllabus.com/syllabus/{course.syllabus}"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="font-bold">Syllabus</span>
          <Book class="mt-0.5 size-3" />
        </Button>
      </div>
      <div class="text-sm">
        <span class="font-bold">Department:</span>
        <span>{course.department}</span>
      </div>
      <div class="text-sm">
        <span class="font-bold">Prerequisites:</span>
        <span>{course.prerequisites || 'None'}</span>
      </div>
    </div>
    <Separator class="my-2" />
    <div class="space-y-2">
      {#each sections as section (section.number)}
        <Section
          {section}
          bind:selected={
            () => selectedSections.has(section.number),
            (selected: boolean) => handleSectionSelect(section.number, selected)
          }
        />
      {/each}
    </div>
  </Collapsible.Content>
</Collapsible.Root>

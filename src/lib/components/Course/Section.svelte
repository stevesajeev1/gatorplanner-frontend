<script lang="ts">
  import type { TypedListClassesByIDRow } from '$lib/api/models';
  import Instructor from './Instructor.svelte';
  import MeetTime from './MeetTime.svelte';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';

  type Props = {
    section: TypedListClassesByIDRow;
    selected: boolean;
  };

  let { section, selected = $bindable() }: Props = $props();
</script>

<div class="rounded-sm bg-gray-300 p-2">
  <div class="flex justify-between">
    <div class="underline">
      <span>Class</span>
      <span class="font-bold">#{section.number}</span>
    </div>
    <Checkbox class="border-gray-500 bg-gray-100" bind:checked={selected} />
  </div>
  <div class="py-1">
    {#if section.note !== null && section.note.trim().length > 0}
      <div class="mb-2 text-sm">
        <span class="font-bold">Note:</span>
        <span class="font-light">{section.note}</span>
      </div>
    {/if}
    <span class="text-sm font-bold">Instructor(s):</span>
    <div>
      {#each section.instructors as instructor, i (i)}
        <Instructor {instructor} />
      {:else}
        <span class="text-sm">No instructors currently scheduled for the class.</span>
      {/each}
    </div>
  </div>
  <div>
    <span class="text-sm font-bold">Meeting Time(s):</span>
    <div>
      <span class="text-sm font-light">{section.meet_type}</span>
      <div>
        {#each section.meet_times as meetTime, i (i)}
          <MeetTime {meetTime} />
        {:else}
          <span class="text-sm">No meet times currently scheduled for the class.</span>
        {/each}
      </div>
    </div>
  </div>
</div>
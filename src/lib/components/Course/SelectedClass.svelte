<script lang="ts">
  import type { SelectedClass } from "./SelectedClass";

  type Props = {
    class: SelectedClass;
  };

  let { class: cls }: Props = $props();
</script>

<div class="p-2 bg-gray-100 rounded-md">
  <div class="flex justify-between">
    <span class="font-semibold">{cls.course.code}</span>
    {#if cls.course.credits_min === cls.course.credits_max}
      <span>{cls.course.credits_min}</span>
    {:else}
      <span>{cls.course.credits_min}-{cls.course.credits_max}</span>
    {/if}
  </div>
  <span>{cls.course.name}</span>
  <span class="text-sm font-light">{cls.classes.map(c => `#${c.number}`).join(", ")}</span>
</div>
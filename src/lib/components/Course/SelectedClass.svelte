<script lang="ts">
  import type { SelectedClass } from './SelectedClass';
  import { Button } from '$lib/components/ui/button/index.js';
  import Trash from '@lucide/svelte/icons/trash';

  type Props = {
    class: SelectedClass;
    ondelete: () => void;
  };

  let { class: cls, ondelete }: Props = $props();
</script>

<div class="rounded-md bg-gray-100 p-2">
  <div class="flex justify-between">
    <span class="font-semibold">{cls.course.code}</span>
    <Button variant="destructive" size="icon-xs" aria-label="Remove" onclick={ondelete}>
      <Trash />
    </Button>
  </div>
  <span>{cls.course.name}</span>
  <div class="flex justify-end">
    <span class="text-sm font-light">{cls.classes.map((c) => `#${c.number}`).join(', ')}</span>
  </div>
  <div class="flex justify-end gap-1 text-sm">
    <span>Credits:</span>
    {#if cls.course.credits_min === cls.course.credits_max}
      <span>{cls.course.credits_min}</span>
    {:else}
      <span>{cls.course.credits_min}-{cls.course.credits_max}</span>
    {/if}
  </div>
</div>

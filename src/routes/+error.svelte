<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="flex h-full flex-col items-center justify-center gap-8">
  <div class="flex flex-col items-center gap-1">
    <h1 class="text-8xl font-bold">{page.status}</h1>
    {#if page.error}
      <span class="text-red-500">{page.error.message}</span>
    {/if}
  </div>
  <span class="text-xs italic">How did we get here?</span>
</div>

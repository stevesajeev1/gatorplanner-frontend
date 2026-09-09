<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="h-full flex flex-col items-center justify-center gap-8">
  <div class="flex flex-col items-center gap-1">
    <h1 class="font-bold text-8xl">{page.status}</h1>
    {#if page.error}
      <span class="text-red-500">{page.error.message}</span>
    {/if}
  </div>
	<span class="italic text-xs">How did we get here?</span>
</div>

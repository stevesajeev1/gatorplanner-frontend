<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import Construction from '@lucide/svelte/icons/construction';
</script>

<div class="flex h-full items-center justify-center">
  <Card.Root>
    <Card.Header>
      <Card.Title>
        <div class="flex items-center justify-center gap-3">
          <Construction size={32} />
          <span class="text-3xl">Under Construction</span>
        </div>
      </Card.Title>
    </Card.Header>
    <Card.Content>
      <span class="text-center italic"
        >What if you had a tool to help you plan your whole degree?</span
      >
    </Card.Content>
    <Card.Footer>
      <span class="text-light text-center text-xs"
        >In the meantime, you can use the Semester Planner to build and explore your schedule.</span
      >
    </Card.Footer>
  </Card.Root>
</div>

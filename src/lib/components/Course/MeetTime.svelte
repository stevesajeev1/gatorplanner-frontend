<script lang="ts">
  import type { CustomMeetTime } from '$lib/api/models';
  import { formatDay } from '$lib/utils/day';
  import { Button } from '$lib/components/ui/button/index.js';

  type Props = {
    meetTime: CustomMeetTime;
  };

  let { meetTime }: Props = $props();

  const formatTime = (time: string) =>
    Temporal.PlainTime.from(time).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
</script>

<div class="ml-3 text-sm">
  <span class="font-semibold">{meetTime.days.map(formatDay).join(', ')}:</span>
  <span
    >{formatTime(meetTime.time_start)} (P{meetTime.period_start}) - {formatTime(meetTime.time_end)} (P{meetTime.period_end})</span
  >
  {#if meetTime.building !== null}
    {@const building = meetTime.building}
    <span>@</span>
    <Button
      class="inline p-0"
      variant="link"
      href="https://campusmap.ufl.edu/?loc={building.code}"
      target="_blank"
      rel="noopener noreferrer"
    >
      {#if building.room === null}
        <span>{building.code}</span>
      {:else}
        <span>{building.name} {building.room}</span>
      {/if}
    </Button>
    <span></span>
  {/if}
</div>

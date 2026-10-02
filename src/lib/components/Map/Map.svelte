<script lang="ts">
  import 'temporal-polyfill/global';
  import { CustomMeetTimeDaysItem } from '$lib/api/models/customMeetTimeDaysItem';
  import {
    Map,
    MapControls,
    MapMarker,
    MapRoute,
    MarkerContent,
    MarkerPopup
  } from '$lib/components/ui/map';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { formatDay } from '$lib/utils/day';
  import type { SelectedSchedule } from '../Schedules/Calendar';
  import type { MapClassMeetTimes, MapStyle } from './Map';
  import { formatTime, parseTime } from '$lib/utils/time';
  import type { TypedBuilding } from '$lib/api/models';
  import { getCourseHue } from '$lib/utils/hue';
  import { SvelteMap } from 'svelte/reactivity';

  type Props = {
    mapStyle: MapStyle;
    selectedSchedule: SelectedSchedule | null;
    buildings: TypedBuilding[];
  };

  const { mapStyle, selectedSchedule, buildings }: Props = $props();

  let day = $state<CustomMeetTimeDaysItem>('M');

  const dayClassMeetTimes = $derived.by(() => {
    const dayClassMeetTimes: MapClassMeetTimes = [];
    if (selectedSchedule === null) return dayClassMeetTimes;

    for (const cls of selectedSchedule.classes) {
      for (const meetTime of cls.class.meet_times) {
        if (!meetTime.days.includes(day)) continue;

        // Class takes place on day
        dayClassMeetTimes.push({
          meetTime,
          scheduleClass: cls
        });
      }
    }

    dayClassMeetTimes.sort((a, b) =>
      Temporal.PlainTime.compare(parseTime(a.meetTime.time_start), parseTime(b.meetTime.time_start))
    );

    return dayClassMeetTimes;
  });

  const route = $derived.by(() => {
    const routeBuildings: TypedBuilding[] = [];

    for (const dayClassMeetTime of dayClassMeetTimes) {
      const building = dayClassMeetTime.meetTime.building;
      if (building === null) continue;

      const fullBuilding = buildings.find((b) => b.id === building.id)!;
      if (fullBuilding.latitude === null || fullBuilding.longitude === null) continue;

      // Check if previous building was the same
      if (routeBuildings.length > 0 && routeBuildings[routeBuildings.length - 1].id === building.id)
        continue;
      routeBuildings.push(fullBuilding);
    }

    const route: [number, number][] = routeBuildings.map((routeBuilding) => [
      routeBuilding.longitude!,
      routeBuilding.latitude!
    ]);
    return route;
  });

  const stops = $derived.by(() => {
    const buildingMap = new SvelteMap<string, MapClassMeetTimes>();

    for (const dayClassMeetTime of dayClassMeetTimes) {
      const building = dayClassMeetTime.meetTime.building;
      if (building === null) continue;

      const fullBuilding = buildings.find((b) => b.id === building.id)!;
      if (fullBuilding.latitude === null || fullBuilding.longitude === null) continue;

      if (!buildingMap.has(building.id)) {
        buildingMap.set(building.id, []);
      }
      buildingMap.get(building.id)!.push(dayClassMeetTime);
    }

    return Array.from(buildingMap.entries()).map(([buildingId, classes]) => ({
      building: buildings.find((b) => b.id === buildingId)!,
      classes
    }));
  });
</script>

<div class="h-full w-full">
  <Map
    center={[-82.3479459, 29.6450138]}
    zoom={15}
    styles={mapStyle}
    loading={selectedSchedule === null}
  >
    <MapRoute coordinates={route} color="#f43f5e" width={4} opacity={0.8} />

    {#each stops as stop, index (stop.building.id)}
      <MapMarker longitude={stop.building.longitude!} latitude={stop.building.latitude!}>
        <MarkerContent>
          <div
            class="flex size-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-xs font-bold text-white transition-transform hover:scale-110"
          >
            {#if stop.classes.length === 1}
              {index + 1}
            {/if}
          </div>
        </MarkerContent>

        <MarkerPopup class="p-1">
          {#each stop.classes as cls, i (i)}
            {@const hue = getCourseHue(cls.scheduleClass.course.id)}
            <div
              class="flex gap-1 border-l-2 border-l-[hsl(var(--hue)_100%_60%)] bg-[hsl(var(--hue)_100%_90%)] p-1"
              style={`--hue: ${hue}`}
            >
              <span class="font-semibold">{cls.scheduleClass.course.code}</span>
              <Separator class="bg-foreground/40" orientation="vertical" />
              <span
                >{formatTime(cls.meetTime.time_start)} (P{cls.meetTime.period_start}) - {formatTime(
                  cls.meetTime.time_end
                )} (P{cls.meetTime.period_end})</span
              >
            </div>
          {/each}
        </MarkerPopup>
      </MapMarker>
    {/each}

    <MapControls />

    {#if selectedSchedule === null}
      <div
        class="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-white p-2 text-xl"
      >
        No schedule currently selected.
      </div>
    {:else}
      <div class="absolute top-3 right-3 z-10">
        <Select.Root type="single" bind:value={day}>
          <Select.Trigger class="w-full bg-white">{formatDay(day)}</Select.Trigger>

          <Select.Content>
            {#each Object.values(CustomMeetTimeDaysItem) as option, i (i)}
              <Select.Item value={option}>{formatDay(option)}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    {/if}
  </Map>
</div>

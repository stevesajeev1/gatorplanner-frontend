<script lang="ts">
  import {
    Map,
    MapControls,
    MapMarker,
    MapRoute,
    MarkerContent,
    MarkerLabel,
    MarkerPopup,
    MarkerTooltip
  } from '$lib/components/ui/map';
  import type { MapStyle } from './Map';

  type Props = {
    mapStyle: MapStyle;
  };

  const { mapStyle }: Props = $props();

  const route: [number, number][] = [
    [-82.34073, 29.64885],
    [-82.34979, 29.6439],
    [-82.34435, 29.64831]
  ];

  const stops = [
    { name: 'LIT', lng: -82.34073, lat: 29.64885 },
    { name: 'NPB', lng: -82.34979, lat: 29.6439 },
    { name: 'CSE', lng: -82.34435, lat: 29.64831 }
  ];
</script>

<div class="h-full w-full">
  <Map center={[-82.3479459, 29.6450138]} zoom={15} styles={mapStyle}>
    <MapRoute coordinates={route} color="#f43f5e" width={4} opacity={0.8} />

    {#each stops as stop, index (stop.name)}
      <MapMarker longitude={stop.lng} latitude={stop.lat}>
        <MarkerContent>
          <div
            class="flex size-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-xs font-bold text-white transition-transform hover:scale-110"
          >
            {index + 1}
          </div>
        </MarkerContent>

        <MarkerPopup class="w-62 p-0">PLACEHOLDER</MarkerPopup>
      </MapMarker>
    {/each}

    <MapControls />

    <div class="absolute top-3 left-3 border-border/50 bg-background/95 backdrop-blur-md z-10">
      <div>MONDAY</div>
    </div>
  </Map>
</div>

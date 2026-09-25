<script lang="ts">
  import { onMount } from 'svelte';
  import { Map, MapControls } from '$lib/components/ui/map';

  const VECTOR_TILE_URL =
    'https://tiles.arcgis.com/tiles/IiuFUnlkob76Az9k/arcgis/rest/services/UFColorBasemapStandard/VectorTileServer';

  const STYLE_URL =
    'https://tiles.arcgis.com/tiles/IiuFUnlkob76Az9k/arcgis/rest/services/UFColorBasemapStandard/VectorTileServer/resources/styles/root.json';

  let styles = $state<{
    light: any;
    dark: any;
  }>({
    light: undefined,
    dark: undefined
  });

  onMount(async () => {
    const response = await fetch(STYLE_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch style: ${response.status}`);
    }

    const style = await response.json();

    style.sprite = `${VECTOR_TILE_URL}/resources/sprites/sprite`;

    style.glyphs = `${VECTOR_TILE_URL}/resources/fonts/{fontstack}/{range}.pbf`;

    style.sources.esri = {
      type: 'vector',
      scheme: 'xyz',
      tiles: [`${VECTOR_TILE_URL}/tile/{z}/{y}/{x}.pbf`],
      minzoom: 12,
      maxzoom: 23
    };

    style.sources.osm = {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    };

    style.layers.unshift({
      id: 'osm-fallback',
      type: 'raster',
      source: 'osm'
    });

    styles.light = structuredClone(style);
    styles.dark = structuredClone(style);
  });
</script>

<div class="h-full w-full">
  {#if styles.light}
    <Map center={[-82.3479459, 29.6450138]} zoom={15} {styles}>
      <MapControls />
    </Map>
  {/if}
</div>

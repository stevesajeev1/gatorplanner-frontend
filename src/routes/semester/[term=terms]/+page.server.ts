import type { MapStyle } from '$lib/components/Map/Map';
import type { RasterSourceSpecification, StyleSpecification } from 'maplibre-gl';
import type { PageServerLoad } from './$types';

const VECTOR_TILE_URL =
  'https://tiles.arcgis.com/tiles/IiuFUnlkob76Az9k/arcgis/rest/services/UFColorBasemapStandard/VectorTileServer';
const STYLE_URL = `${VECTOR_TILE_URL}/resources/styles/root.json`;

const OSM_SOURCE: RasterSourceSpecification = {
  type: 'raster',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
  attribution: '© OpenStreetMap contributors'
};

const createOsmStyle = (): MapStyle => {
  const style: StyleSpecification = {
    version: 8,
    sources: { osm: OSM_SOURCE },
    layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }]
  };
  return { light: style, dark: style };
};

const fetchMapStyle = async (fetchFn: typeof fetch): Promise<MapStyle> => {
  // TODO: cache fetch once deployed to Cloudflare https://developers.cloudflare.com/workers/examples/cache-using-fetch/
  const response = await fetchFn(STYLE_URL);
  // Fallback to OSM
  if (!response.ok) {
    return createOsmStyle();
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

  style.sources.osm = OSM_SOURCE;

  style.layers.unshift({
    id: 'osm-fallback',
    type: 'raster',
    source: 'osm'
  });

  return {
    light: style,
    dark: style
  };
};

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  return {
    mapStyle: await fetchMapStyle(fetch)
  };
};

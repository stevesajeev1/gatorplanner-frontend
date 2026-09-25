import type { TypedListClassesByIDRow } from '$lib/api/models';
import type { TypedListCoursesByIDRow } from '$lib/api/models/typedListCoursesByIDRow';
import type { PersistedMap } from '$lib/utils/persist.svelte';
import type { SvelteSet } from 'svelte/reactivity';

export type _SelectedClasses = PersistedMap<
  TypedListCoursesByIDRow['id'],
  SvelteSet<TypedListClassesByIDRow['id']>,
  TypedListClassesByIDRow['id'][]
>;

export type SelectedClass = {
  course: TypedListCoursesByIDRow;
  classes: TypedListClassesByIDRow[];
};

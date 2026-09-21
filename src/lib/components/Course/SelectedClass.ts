import type { TypedListClassesByIDRow } from '$lib/api/models';
import type { TypedListCoursesByIDRow } from '$lib/api/models/typedListCoursesByIDRow';
import type { SvelteMap, SvelteSet } from 'svelte/reactivity';

export type _SelectedClasses = SvelteMap<
  TypedListCoursesByIDRow['code'],
  SvelteSet<TypedListClassesByIDRow['number']>
>;

export type SelectedClass = {
  course: Pick<TypedListCoursesByIDRow, 'code' | 'name' | 'credits_min' | 'credits_max'>;
  classes: Pick<TypedListClassesByIDRow, 'number'>[];
};

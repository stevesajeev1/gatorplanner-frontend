import type { TypedListClassesByIDRow } from '$lib/api/models';
import type { TypedListCoursesByIDRow } from '$lib/api/models/typedListCoursesByIDRow';

export type _SelectedClasses = Map<
  TypedListCoursesByIDRow['code'],
  Set<TypedListClassesByIDRow['number']>
>;

export type SelectedClass = {
  course: Pick<TypedListCoursesByIDRow, 'code' | 'name' | 'credits_min' | 'credits_max'>;
  classes: Pick<TypedListClassesByIDRow, 'number'>[];
}
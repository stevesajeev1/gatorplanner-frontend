import type { TypedListClassesByIDRow } from '$lib/api/models';
import type { TypedListCoursesByIDRow } from '$lib/api/models/typedListCoursesByIDRow';

export type SelectedClass = {
  course: TypedListCoursesByIDRow;
  classes: TypedListClassesByIDRow[];
};

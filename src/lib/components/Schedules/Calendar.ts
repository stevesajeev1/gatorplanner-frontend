import type { TypedListClassesByIDRow, TypedListCoursesByIDRow } from "$lib/api/models"

export type ScheduleClass = {
  course: TypedListCoursesByIDRow;
  class: TypedListClassesByIDRow;
}

type SelectedClass = ScheduleClass;

export type SelectedSchedule = {
  classes: SelectedClass[];
};
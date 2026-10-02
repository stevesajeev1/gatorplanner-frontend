import 'temporal-polyfill/global';
import type { StyleSpecification } from 'maplibre-gl';
import type { ScheduleClass } from '../Schedules/Calendar';
import type { CustomMeetTime } from '$lib/api/models';

export type MapStyle = {
  light: StyleSpecification;
  dark: StyleSpecification;
};

type MapClassMeetTime = {
  meetTime: CustomMeetTime;
  scheduleClass: ScheduleClass;
};

export type MapClassMeetTimes = MapClassMeetTime[];

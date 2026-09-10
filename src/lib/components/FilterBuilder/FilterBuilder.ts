// INTERNAL TYPES

import { FilterRuleBooleanField, FilterRuleBooleanFilter, FilterRuleNumberGeneralFieldField, FilterRuleNumberGeneralFieldFilter, FilterRuleNumberPeriodField, FilterRuleNumberPeriodFilter, FilterRuleTextClassMeetTypeField, FilterRuleTextClassMeetTypeFilter, FilterRuleTextCourseGenEdsField, FilterRuleTextCourseGenEdsFilter, FilterRuleTextCourseMeetDaysField, FilterRuleTextCourseMeetDaysFilter, FilterRuleTextCourseQuestField, FilterRuleTextCourseQuestFilter, FilterRuleTextGeneralFieldField, FilterRuleTextGeneralFieldFilter, FilterRuleTimeField, FilterRuleTimeFilter, type FilterRule } from "$lib/api/models";

export type Field<R extends FilterRule = FilterRule> = {
	id: R['field'];
	label: string;
	type: R['type'];
};

type Option<F extends Field> = {
	value: Extract<FilterRule, { type: F['type'] }>['value'];
	label?: string;
};

export type Options<F extends readonly Field[]> = {
	[K in F[number]['id']]?: Option<Extract<F[number], { id: K }>>[];
};

export type _Rule<F extends Field = Field> = {
	field: F;
	filter: Extract<FilterRule, { type: F['type'] }>['filter'];
	value: Extract<FilterRule, { type: F['type'] }>['value'];
}

type NonEmptyArray<T> = [T, ...T[]];

export type _Filter = {
	glue: "and" | "or";
	rules: NonEmptyArray<_Rule | _Filter>;
}

export const isFilter = (r: _Filter["rules"][number]): r is _Filter => {
	return "glue" in r;
}

// UTILITIES
function isEnumValue<T extends Record<string, string>>(
  values: T,
  value: unknown
): value is T[keyof T] {
	console.log(Object.values(values))
  return Object.values(values).some(v => v === value);
}

export function getFilters<R extends FilterRule = FilterRule>(field: R['field']): R['filter'][] {
	// TEXT
	if (isEnumValue(FilterRuleTextClassMeetTypeField, field)) {
    return Object.values(FilterRuleTextClassMeetTypeFilter);
  }
	if (isEnumValue(FilterRuleTextCourseGenEdsField, field)) {
    return Object.values(FilterRuleTextCourseGenEdsFilter);
  }
	if (isEnumValue(FilterRuleTextCourseQuestField, field)) {
    return Object.values(FilterRuleTextCourseQuestFilter);
  }
	if (isEnumValue(FilterRuleTextCourseMeetDaysField, field)) {
    return Object.values(FilterRuleTextCourseMeetDaysFilter);
  }
	if (isEnumValue(FilterRuleTextGeneralFieldField, field)) {
    return Object.values(FilterRuleTextGeneralFieldFilter);
  }

	// NUMBER
  if (isEnumValue(FilterRuleNumberPeriodField, field)) {
    return Object.values(FilterRuleNumberPeriodFilter);
  }
  if (isEnumValue(FilterRuleNumberGeneralFieldField, field)) {
    return Object.values(FilterRuleNumberGeneralFieldFilter);
  }

  // TIME
  if (isEnumValue(FilterRuleTimeField, field)) {
    return Object.values(FilterRuleTimeFilter);
  }

  // BOOLEAN
  if (isEnumValue(FilterRuleBooleanField, field)) {
    return Object.values(FilterRuleBooleanFilter);
	}

  return [];
}
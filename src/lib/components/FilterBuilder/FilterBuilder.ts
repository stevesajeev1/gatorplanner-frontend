// INTERNAL TYPES

import {
  FilterRuleBooleanField,
  FilterRuleBooleanFilter,
  FilterRuleNumberGeneralFieldField,
  FilterRuleNumberGeneralFieldFilter,
  FilterRuleNumberPeriodField,
  FilterRuleNumberPeriodFilter,
  FilterRuleTextClassMeetTypeField,
  FilterRuleTextClassMeetTypeFilter,
  FilterRuleTextCourseGenEdsField,
  FilterRuleTextCourseGenEdsFilter,
  FilterRuleTextCourseMeetDaysField,
  FilterRuleTextCourseMeetDaysFilter,
  FilterRuleTextCourseQuestField,
  FilterRuleTextCourseQuestFilter,
  FilterRuleTextGeneralFieldField,
  FilterRuleTextGeneralFieldFilter,
  FilterRuleTimeField,
  FilterRuleTimeFilter,
  type Filter,
  type FilterRule
} from '$lib/api/models';

export type Field<R extends FilterRule = FilterRule> = {
  id: R['field'];
  label: string;
  type: R['type'];
};

type PropertyForField<F extends Field, P extends keyof FilterRule> = FilterRule extends infer R
  ? R extends FilterRule
    ? F['id'] extends R['field']
      ? R[P]
      : never
    : never
  : never;

type Option<F extends Field> = {
  value: PropertyForField<F, 'value'>;
  label?: string;
};

export type Options<F extends readonly Field[]> = {
  [K in F[number]['id']]?: Option<Extract<F[number], { id: K }>>[];
};

export type _Rule<F extends Field = Field> = {
  field: F;
  filter: PropertyForField<F, 'filter'>;
  value: PropertyForField<F, 'value'>;
};

type NonEmptyArray<T> = [T, ...T[]];

export type _Filter = {
  glue: 'and' | 'or';
  rules: NonEmptyArray<_Rule | _Filter>;
};

export const isFilter = (r: _Filter['rules'][number]): r is _Filter => {
  return 'glue' in r;
};

// UTILITIES
function isEnumValue<T extends Record<string, string>>(
  values: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(values).some((v) => v === value);
}

type LabelledFilter<R extends FilterRule> = {
  label: string;
  value: R['filter'];
};

export function getFilterLabel<R extends FilterRule>(filter: R['filter']): LabelledFilter<R> {
  switch (filter) {
    case 'equal':
      return { value: filter, label: '=' };

    case 'notEqual':
      return { value: filter, label: '≠' };

    case 'greater':
      return { value: filter, label: '>' };

    case 'less':
      return { value: filter, label: '<' };

    case 'greaterOrEqual':
      return { value: filter, label: '>=' };

    case 'lessOrEqual':
      return { value: filter, label: '<=' };
  }
}

export function getFilters<R extends FilterRule>(field: R['field']): LabelledFilter<R>[] {
  let filters: R['filter'][] = [];

  // TEXT
  if (isEnumValue(FilterRuleTextClassMeetTypeField, field)) {
    filters = Object.values(FilterRuleTextClassMeetTypeFilter);
  }
  if (isEnumValue(FilterRuleTextCourseGenEdsField, field)) {
    filters = Object.values(FilterRuleTextCourseGenEdsFilter);
  }
  if (isEnumValue(FilterRuleTextCourseQuestField, field)) {
    filters = Object.values(FilterRuleTextCourseQuestFilter);
  }
  if (isEnumValue(FilterRuleTextCourseMeetDaysField, field)) {
    filters = Object.values(FilterRuleTextCourseMeetDaysFilter);
  }
  if (isEnumValue(FilterRuleTextGeneralFieldField, field)) {
    filters = Object.values(FilterRuleTextGeneralFieldFilter);
  }

  // NUMBER
  if (isEnumValue(FilterRuleNumberPeriodField, field)) {
    filters = Object.values(FilterRuleNumberPeriodFilter);
  }
  if (isEnumValue(FilterRuleNumberGeneralFieldField, field)) {
    filters = Object.values(FilterRuleNumberGeneralFieldFilter);
  }

  // TIME
  if (isEnumValue(FilterRuleTimeField, field)) {
    filters = Object.values(FilterRuleTimeFilter);
  }

  // BOOLEAN
  if (isEnumValue(FilterRuleBooleanField, field)) {
    filters = Object.values(FilterRuleBooleanFilter);
  }

  return filters.map(getFilterLabel);
}

export function getDefaultValue<F extends Field>(field: F, options: Options<F[]>) {
  if (field.id in options) return options[field.id as keyof Options<F[]>]![0].value;

  switch (field.type) {
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'time':
      return '12:00:00';
    case 'text':
      return '';
  }
}

export const toFilter = (filter: _Filter): Filter => {
  return {
    glue: filter.glue,
    rules: filter.rules.map((r) => {
      if (isFilter(r)) {
        return toFilter(r);
      }
      return {
        field: r.field.id,
        filter: r.filter,
        type: r.field.type,
        value: r.value
      } as FilterRule;
    })
  };
};

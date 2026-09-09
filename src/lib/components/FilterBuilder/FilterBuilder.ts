type RuleText = {
	field: string;
	type: 'text';
	filter: string;
	value: string;
};

type RuleNumber = {
	field: string;
	type: 'number';
	filter: string;
	value: number;
};

type RuleTime = {
	field: string;
	type: 'time';
	filter: string;
	value: Temporal.PlainTime;
};

type RuleBoolean = {
	field: string;
	type: 'boolean';
	filter: string;
	value: boolean;
};

type Rule = RuleText | RuleNumber | RuleTime | RuleBoolean;

type NonEmptyArray<T> = [T, ...T[]];

// INTERNAL TYPES

export type Field<R extends Rule = Rule> = {
	id: R['field'];
	label: string;
	type: R['type'];
};

type Option<F extends Field> = {
	value: Extract<Rule, { type: F['type'] }>['value'];
	label?: string;
};

export type Options<F extends readonly Field[]> = {
	[K in F[number]['id']]?: Option<Extract<F[number], { id: K }>>[];
};

export type _Rule<F extends Field = Field> = {
	field: F;
	filter: Extract<Rule, { type: F['type'] }>['filter'];
	value: Extract<Rule, { type: F['type'] }>['value'];
}

export type _Filter = {
	glue: "and" | "or";
	rules: NonEmptyArray<_Rule | _Filter>;
}

export function isFilter(r: _Filter["rules"][number]): r is _Filter {
	return "glue" in r;
}
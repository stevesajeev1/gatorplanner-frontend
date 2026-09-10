<script lang="ts">
	import Funnel from '@lucide/svelte/icons/funnel';
	import Search from '@lucide/svelte/icons/search';
	import Loader from '@lucide/svelte/icons/loader-circle';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { getTerm } from '$lib/utils/term';

	import type { PageProps } from './$types';
	import FilterBuilder from '$lib/components/FilterBuilder/FilterBuilder.svelte';
	import type { Field, Options } from '$lib/components/FilterBuilder/FilterBuilder';
  import { FilterRuleNumberPeriodValue, FilterRuleTextClassMeetTypeValue, FilterRuleTextCourseGenEdsValue, FilterRuleTextCourseMeetDaysValue, FilterRuleTextCourseQuestValue } from '$lib/api/models';
	let { params }: PageProps = $props();

	let filterEnabled = $state(true);
	let loading = $state(false);

	const fields = [
		{ id: 'meet_type', label: 'Meet Type', type: 'text' },
		{ id: 'course_gen_eds', label: 'Gen Ed', type: 'text' },
		{ id: 'course_quest', label: 'Quest', type: 'text' },
		{ id: 'meet_times.days', label: 'Day', type: 'text' },
		{ id: 'course_code', label: 'Code', type: 'text' },
		{ id: 'course_code_prefix', label: 'Code Prefix', type: 'text' },
		{ id: 'course_name', label: 'Name', type: 'text' },
		{ id: 'course_department', label: 'Department', type: 'text' },
		{ id: 'meet_times.building', label: 'Building', type: 'text' },
		{ id: 'instructors.name', label: 'Instructor Name', type: 'text' },
		{ id: 'meet_times.period_start', label: 'Period Start', type: 'number' },
		{ id: 'meet_times.period_end', label: 'Period End', type: 'number' },
		{ id: 'number', label: 'Number', type: 'number' },
		{ id: 'course_level', label: 'Level', type: 'number' },
		{ id: 'course_credits', label: 'Credits', type: 'number' },
		{ id: 'course_words', label: 'Words', type: 'number' },
		{ id: 'instructors.rating', label: 'Instructor Rating', type: 'number' },
		{ id: 'instructors.difficulty', label: 'Instructor Difficulty', type: 'number' },
		{ id: 'instructors.take_again', label: 'Instructor Retake %', type: 'number' },
		{ id: 'instructors.take_again', label: 'Instructor Retake %', type: 'number' },
		{ id: 'meet_times.time_start', label: 'Start Time', type: 'time' },
		{ id: 'meet_times.time_end', label: 'End Time', type: 'time' },
		{ id: 'course_is_lab', label: 'Lab', type: 'boolean' },
		{ id: 'course_is_ai', label: 'AI', type: 'boolean' },
		{ id: 'course_is_honors', label: 'Honors', type: 'boolean' },
	] as const satisfies readonly Field[];

	const options = {
		"meet_type": Object.values(FilterRuleTextClassMeetTypeValue).map(value => ({ value })),
		"course_gen_eds": Object.values(FilterRuleTextCourseGenEdsValue).map(value => ({ value })),
		"course_quest": Object.values(FilterRuleTextCourseQuestValue).map(value => ({ value })),
		"meet_times.days": Object.values(FilterRuleTextCourseMeetDaysValue).map(value => ({ value })),
		"meet_times.period_start": Object.values(FilterRuleNumberPeriodValue).map(value => ({ value })),
		"meet_times.period_end": Object.values(FilterRuleNumberPeriodValue).map(value => ({ value })),
	} as const satisfies Options<typeof fields>;
</script>

<div class="flex flex-col gap-2 p-3">
	<h1 class="text-xl font-semibold">{getTerm(params.term)}</h1>

	<div class="grid grid-cols-5">
		<div class="col-span-2 flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<InputGroup.Root class="flex-1" data-disabled={loading}>
					<InputGroup.Input placeholder="Search Classes" disabled={loading} />
					<InputGroup.Addon align="inline-end">
						{#if loading}
							<Loader class="animate-spin" />
						{/if}
					</InputGroup.Addon>
				</InputGroup.Root>

				<Button
					variant={filterEnabled ? 'default' : 'outline'}
					size="icon"
					aria-label="Filter"
					onclick={() => (filterEnabled = !filterEnabled)}
					disabled={loading}
				>
					<Funnel />
				</Button>

				<Button variant="outline" size="icon" aria-label="Search" disabled={loading}>
					<Search />
				</Button>
			</div>

			{#if filterEnabled}
				<FilterBuilder {fields} {options} disabled={loading} />
			{/if}
		</div>
	</div>
</div>

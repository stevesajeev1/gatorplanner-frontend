<script lang="ts" generics="F extends readonly Field[]">
	import Plus from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import FilterRule from './FilterRule.svelte';
	import type { Field, _Filter, Options } from './FilterBuilder';

	type Props = {
		fields: F;
		options: Options<F>;
		disabled?: boolean;
	};

	let { fields, options, disabled = false }: Props = $props();

	let filter = $state<_Filter | null>({
		glue: 'or',
		rules: [
			{
				glue: 'and',
				rules: [
					{
						field: fields[0],
						filter: 'equal',
						value: 'Alex'
					},
					{
						field: fields[1],
						filter: 'greater',
						value: 4
					},
					{
						field: fields[1],
						filter: 'less',
						value: 20
					}
				]
			},
			{
				field: fields[1],
				filter: 'equal',
				value: 3
			}
		]
	});

	const deleteFilter = () => {
		filter = null;
	}
</script>

<div class="flex items-center gap-2 overflow-x-auto *:shrink-0 pb-2">
	{#if filter === null}
		<Button variant="outline" size="sm">
			<Plus /> Add Filter
		</Button>
	{:else}
		<FilterRule {filter} {fields} {options} {deleteFilter} />
	{/if}
</div>

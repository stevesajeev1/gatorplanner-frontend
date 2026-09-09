<script lang="ts" generics="F extends readonly Field[]">
	import Ellipsis from '@lucide/svelte/icons/ellipsis-vertical';
	import FunnelPlus from '@lucide/svelte/icons/funnel-plus';
	import ListFilterPlus from '@lucide/svelte/icons/list-filter-plus';
	import Trash from '@lucide/svelte/icons/trash';
	import Pencil from '@lucide/svelte/icons/pencil';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { isFilter } from './FilterBuilder';
	import type { Field, Options, _Rule, _Filter } from './FilterBuilder';
	import FilterRule from './FilterRule.svelte';
	import FilterEditor from './FilterEditor.svelte';

	type Props = {
		filter: _Filter;
		fields: F;
		options: Options<F>;
		deleteFilter: () => void;
	};

	type Editing = {
		rule: _Rule;
		idx: number;
	};

	let editing: Editing | null = $state(null);
	let customAnchors = $state<HTMLElement[]>([]);

	let { filter, fields, options, deleteFilter }: Props = $props();

	const toggleGlue = () => {
		filter.glue = filter.glue === 'and' ? 'or' : 'and';
	};

	const editRule = (rule: _Rule, idx: number) => {
		editing = {
			rule,
			idx
		};
	};

	const deleteRule = (idx: number) => {
		if (filter.rules.length === 1) {
			deleteFilter();
		} else {
			filter.rules.splice(idx, 1);
		}
	};
</script>

{#each filter.rules as rule, i}
	{#if isFilter(rule)}
		<span class="text-2xl">(</span>
		<FilterRule filter={rule} {fields} {options} deleteFilter={() => deleteRule(i)} />
		<span class="text-2xl">)</span>
	{:else}
		{#if i > 0}
			<Button
				variant="outline"
				size="xs"
				class={`w-10 rounded-full text-sm font-light ${filter.glue === 'and' ? 'bg-orange-300' : 'bg-green-400'}`}
				onclick={toggleGlue}
			>
				{filter.glue}
			</Button>
		{/if}
		<div
			bind:this={customAnchors[i]}
			class="flex items-center gap-1.5 rounded-sm bg-gray-100 p-2 text-sm"
		>
			<span class="font-semibold">{rule.field.label}</span>
			<span>{rule.filter}</span>
			<span class="text-blue-500">{rule.value}</span>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Ellipsis class="size-4" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Group>
						<DropdownMenu.Item onSelect={() => editRule(rule, i)}>
							<Pencil />
							Edit
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<FunnelPlus />
							Add filter
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<ListFilterPlus />
							Add group
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onSelect={() => deleteRule(i)}>
							<Trash />
							Delete
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
{/each}

<Popover.Root
	open={editing !== null}
	onOpenChange={(open) => {
		if (!open) {
			editing = null;
		}
	}}
>
	<Popover.Trigger />
	{#if editing !== null}
		<Popover.Content customAnchor={customAnchors[editing.idx]} align="end">
			{#key editing.idx}
				<FilterEditor rule={editing.rule} {fields} {options} />
			{/key}
		</Popover.Content>
	{/if}
</Popover.Root>

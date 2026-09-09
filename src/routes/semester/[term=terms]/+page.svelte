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
	let { params }: PageProps = $props();

	let filterEnabled = $state(true);
	let loading = $state(false);

	const fields = [
		{ id: 'first_name', label: 'First Name', type: 'text' },
		{ id: 'age', label: 'Age', type: 'number' },
	] as const satisfies readonly Field[];

	const options = {
		first_name: [{ value: 'Alex' }, { value: 'Adam' }, { value: 'Agata' }],
		age: [{ value: 24 }, { value: 26 }, { value: 33 }, { value: 35 }, { value: 44 }, { value: 45 }, { value: 62 }],
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

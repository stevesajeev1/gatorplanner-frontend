<script lang="ts" generics="F extends readonly Field[]">
	import type { _Rule, Field, Options } from './FilterBuilder';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	type Props = {
		rule: _Rule;
		fields: F;
		options: Options<F>;
	};

	let { rule, fields, options }: Props = $props();

	const ruleSchema = z.object({
		field: z.string(),
		filter: z.string(),
		value: z.string()
	});

	// svelte-ignore state_referenced_locally
	const form = superForm(
		{
			field: rule.field.id,
			filter: rule.filter,
			value: String(rule.value)
		},
		{
			validators: zod4(ruleSchema)
		}
	);

	const { form: formData } = form;

	const hasOptions = (field: string): field is keyof Options<F> => {
		return field in options;
	};
</script>

<form class="flex flex-col gap-4">
	<Form.Field {form} name="field">
		<Form.Control>
			<Form.Label>Field</Form.Label>
			<Select.Root type="single" bind:value={$formData.field}>
				<Select.Trigger class="w-full">
					{fields.find((f) => f.id === $formData.field)!.label}
				</Select.Trigger>
				<Select.Content>
					{#each fields as field}
						<Select.Item value={field.id}>{field.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</Form.Control>
	</Form.Field>

	<div class="grid grid-cols-2 gap-3">
		<Form.Field {form} name="filter">
			<Form.Control>
				<Form.Label>Filter</Form.Label>
				<!-- <Select.Root type="single" bind:value={$formData.field}>
					<Select.Trigger class="w-full">
						{fields.find((f) => f.id === $formData.field)!.label}
					</Select.Trigger>
					<Select.Content>
						{#each fields as field}
							<Select.Item value={field.id}>{field.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root> -->
			</Form.Control>
		</Form.Field>

		<Form.Field {form} name="value">
			<Form.Control>
				<Form.Label>Value</Form.Label>
				{#if hasOptions($formData.field)}
					<Select.Root type="single" bind:value={$formData.value}>
						<Select.Trigger class="w-full"></Select.Trigger>
						<Select.Content>
							{#each options[$formData.field] as option}
								<Select.Item value={option.value}>{option.label ?? option.value}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</Form.Control>
		</Form.Field>
	</div>

	<div class="flex justify-end gap-2">
		<Button type="button" variant="outline">Cancel</Button>
		<Button type="button">Apply</Button>
	</div>
</form>

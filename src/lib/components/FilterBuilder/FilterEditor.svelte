<script lang="ts" generics="F extends readonly Field[]">
  import { getFilters, type _Rule, type Field, type Options } from './FilterBuilder';

  import * as Form from '$lib/components/ui/form/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { superForm } from 'sveltekit-superforms';
  import type { FilterRule } from '$lib/api/models';

  type Props = {
    rule: _Rule<F[number]>;
    fields: F;
    options: Options<F>;
  };

  type FormData = {
    field: FilterRule['field'];
    filter: FilterRule['filter'];
    value: string;
  };

  let { rule = $bindable(), fields, options }: Props = $props();

  const initialData: FormData = {
    field: rule.field.id,
    filter: rule.filter,
    value: String(rule.value)
  };

  const form = superForm(initialData);
  const { form: formData } = form;

  const selectedField = $derived(fields.find((f) => f.id === $formData.field)!);
  const filters = $derived(getFilters($formData.field));

  const getOptions = (field: F[number]['id']) => {
    return options[field]!;
  };

  const clearInputs = () => {
    $formData.filter = filters[0].value;
    if ($formData.field in options) {
      $formData.value = String(getOptions($formData.field)[0].value);
    } else if (selectedField.type === 'boolean') {
      $formData.value = 'true';
    } else if (selectedField.type === 'time') {
      $formData.value = '12:00:00';
    } else if (selectedField.type === 'number') {
      $formData.value = '0';
    } else {
      $formData.value = '';
    }
  };

  $effect(() => {
    rule.field = selectedField as F[number];
    rule.filter = $formData.filter as typeof rule.filter;
    switch (selectedField.type) {
      case 'number': {
        if (
          selectedField.id === 'meet_times.period_start' ||
          selectedField.id === 'meet_times.period_end'
        ) {
          rule.value = $formData.value as typeof rule.value;
          break;
        }

        const value = parseFloat($formData.value);
        if (Number.isNaN(value)) break;

        rule.value = value as typeof rule.value;
        break;
      }
      case 'boolean': {
        rule.value = ($formData.value === 'true') as typeof rule.value;
        break;
      }
      case 'time': {
        if ($formData.value.length > 'HH:MM'.length) {
          rule.value = $formData.value.substring(
            0,
            $formData.value.length - 3
          ) as typeof rule.value;
        } else {
          rule.value = $formData.value as typeof rule.value;
        }
        break;
      }
      case 'text': {
        rule.value = $formData.value as typeof rule.value;
        break;
      }
    }
  });
</script>

<form class="flex flex-col gap-4">
  <Form.Field {form} name="field">
    <Form.Control>
      <Form.Label>Field</Form.Label>

      <Select.Root type="single" bind:value={$formData.field} onValueChange={clearInputs}>
        <Select.Trigger class="w-full">
          {selectedField.label}
        </Select.Trigger>

        <Select.Content class="max-h-75">
          {#each fields as field (field.id)}
            <Select.Item value={field.id}>
              {field.label}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </Form.Control>
  </Form.Field>

  <div class="grid grid-cols-2 gap-3">
    <Form.Field {form} name="filter">
      <Form.Control>
        <Form.Label>Filter</Form.Label>

        <Select.Root type="single" bind:value={$formData.filter}>
          <Select.Trigger class="w-full">
            {filters.find((f) => f.value === $formData.filter)!.label}
          </Select.Trigger>

          <Select.Content>
            {#each filters as filter (filter.value)}
              <Select.Item value={filter.value}>
                {filter.label}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </Form.Control>
    </Form.Field>

    <Form.Field {form} name="value">
      <Form.Control>
        <Form.Label>Value</Form.Label>

        {#if $formData.field in options}
          <Select.Root type="single" bind:value={$formData.value}>
            <Select.Trigger class="w-full">
              <span class="min-w-0 truncate">
                {getOptions($formData.field).find((f) => String(f.value) === $formData.value)
                  ?.label ?? $formData.value}
              </span>
            </Select.Trigger>

            <Select.Content>
              {#each getOptions($formData.field) as option (option.value)}
                <Select.Item value={String(option.value)}>
                  {option.label ?? option.value}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {:else if selectedField.type === 'boolean'}
          <Select.Root type="single" bind:value={$formData.value}>
            <Select.Trigger class="w-full">
              {$formData.value}
            </Select.Trigger>

            <Select.Content>
              <Select.Item value="true"></Select.Item>
              <Select.Item value="false"></Select.Item>
            </Select.Content>
          </Select.Root>
        {:else if selectedField.type === 'time'}
          <Input type="time" step="1" bind:value={$formData.value} />
        {:else if selectedField.type === 'number'}
          <Input type="number" bind:value={$formData.value} />
        {:else}
          <Input type="text" step="60" bind:value={$formData.value} />
        {/if}
      </Form.Control>
    </Form.Field>
  </div>
</form>

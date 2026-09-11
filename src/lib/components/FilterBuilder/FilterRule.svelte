<script lang="ts" generics="F extends readonly Field[]">
  import Ellipsis from '@lucide/svelte/icons/ellipsis-vertical';
  import FunnelPlus from '@lucide/svelte/icons/funnel-plus';
  import ListFilterPlus from '@lucide/svelte/icons/list-filter-plus';
  import Trash from '@lucide/svelte/icons/trash';
  import Pencil from '@lucide/svelte/icons/pencil';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { getDefaultValue, getFilterLabel, getFilters, isFilter } from './FilterBuilder';
  import type { Field, Options, _Rule, _Filter } from './FilterBuilder';
  import FilterRule from './FilterRule.svelte';
  import FilterEditor from './FilterEditor.svelte';

  type Props = {
    filter: _Filter;
    fields: F;
    options: Options<F>;
    deleteFilter: () => void;
    disabled?: boolean;
  };

  type Editing = {
    rule: _Rule;
    idx: number;
  };

  let editing: Editing | null = $state(null);
  let customAnchors = $state<HTMLElement[]>([]);

  let { filter = $bindable(), fields, options, deleteFilter, disabled = false }: Props = $props();

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

  const createNewRule = (idx: number, group: boolean) => {
    if (group) {
      filter.rules.splice(idx + 1, 0, {
        glue: 'or',
        rules: [
          {
            field: fields[0],
            filter: getFilters(fields[0].id)[0].value as _Rule['filter'],
            value: getDefaultValue(fields[0], options) as _Rule['value']
          }
        ]
      });
    } else {
      filter.rules.splice(idx + 1, 0, {
        field: fields[0],
        filter: getFilters(fields[0].id)[0].value as _Rule['filter'],
        value: getDefaultValue(fields[0], options) as _Rule['value']
      });
    }
  };

  const getOptionLabel = (field: F[number]['id'], value: unknown) => {
    return options[field]?.find((option) => option.value === value)!.label ?? value;
  };

  $effect(() => {
    if (disabled) editing = null;
  })
</script>

{#each filter.rules as rule, i}
  {#if i > 0}
    <Button
      variant="outline"
      size="xs"
      class={`w-10 rounded-full text-sm font-light ${filter.glue === 'and' ? 'bg-orange-300' : 'bg-green-400'}`}
      onclick={toggleGlue}
      {disabled}
    >
      {filter.glue}
    </Button>
  {/if}
  {#if isFilter(rule)}
    <span class="text-2xl">(</span>
    <FilterRule bind:filter={filter.rules[i] as _Filter} {fields} {options} deleteFilter={() => deleteRule(i)} />
    <span class="text-2xl">)</span>
  {:else}
    <div
      bind:this={customAnchors[i]}
      class="flex items-center gap-1.5 rounded-sm bg-gray-100 p-2 text-sm {disabled && "opacity-75"}"
    >
      <span class="font-semibold">{rule.field.label}</span>
      <span>{getFilterLabel(rule.filter).label}</span>
      <span class="text-blue-500">{getOptionLabel(rule.field.id, rule.value)}</span>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger {disabled}>
          <Ellipsis class="size-4" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Group>
            <DropdownMenu.Item onSelect={() => editRule(rule, i)}>
              <Pencil />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => createNewRule(i, false)}>
              <FunnelPlus />
              Add filter
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => createNewRule(i, true)}>
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
        <FilterEditor bind:rule={editing.rule} {fields} {options} />
      {/key}
    </Popover.Content>
  {/if}
</Popover.Root>

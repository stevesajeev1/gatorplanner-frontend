<script lang="ts" generics="F extends readonly Field[]">
  import Plus from '@lucide/svelte/icons/plus';
  import { Button } from '$lib/components/ui/button/index.js';
  import FilterRule from './FilterRule.svelte';
  import {
    type Field,
    type _Filter,
    type Options,
    getFilters,
    type _Rule,
    getDefaultValue,
    toFilter
  } from './FilterBuilder';
  import type { Filter } from '$lib/api/models';

  type Props = {
    class?: string;
    fields: F;
    options: Options<F>;
    hidden?: boolean;
    disabled?: boolean;
  };

  let {
    class: className = '',
    fields,
    options,
    hidden = false,
    disabled = false
  }: Props = $props();

  let filter = $state<_Filter | null>(null);

  const createFilter = () => {
    filter = {
      glue: 'or',
      rules: [
        {
          field: fields[0],
          filter: getFilters(fields[0].id)[0].value as _Rule['filter'],
          value: getDefaultValue(fields[0], options) as _Rule['value']
        }
      ]
    };
  };

  const deleteFilter = () => {
    filter = null;
  };

  export const getFilter = (): Filter | null => {
    if (filter === null) return null;
    return toFilter(filter);
  };
</script>

<div class="{className} flex items-center gap-2 overflow-x-auto pb-2 *:shrink-0 {!hidden && 'hidden'}">
  {#if filter === null}
    <Button variant="outline" size="sm" onclick={createFilter} {disabled}>
      <Plus /> Add Filter
    </Button>
  {:else}
    <FilterRule bind:filter {fields} {options} {deleteFilter} {disabled} />
  {/if}
</div>

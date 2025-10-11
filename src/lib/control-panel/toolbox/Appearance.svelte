<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import { appearanceData } from '$lib/static/control-panel-config.svelte';
    import { SETTINGS } from '$lib/static/graph-config.svelte';
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';

    /**
     * @param {string} type
     */
    function filterInput(type) {
        return appearanceData.filter((inp) => inp.type === type);
    }

    const checkboxes = filterInput('checkbox');
    const selects = filterInput('select');
    const colors = filterInput('color');
</script>

<ToolBox legend="Appearance" direction="col">
    <li class="flex flex-row items-center gap-3">
        {#each checkboxes as checkbox}
            <CheckBox bind:checked={SETTINGS.ui[checkbox.id]} label={checkbox.label} />
        {/each}
    </li>
    {#each selects as select}
        <li class="flex flex-row items-center justify-between gap-3">
            <label for={select.id}>{select.label}</label>
            <select
                name={select.id}
                id={select.id}
                class="w-1/2 border border-black p-1 text-center"
                bind:value={SETTINGS.ui[select.id]}
            >
                {#each select.options as option, i}
                    <option value={option} selected={i === 0}>{option}</option>
                {/each}
            </select>
        </li>
    {/each}
    {#each colors as color}
        <li class="flex flex-row items-center justify-between gap-3">
            <label for={color.id}>{color.label}</label>
            <input
                type="color"
                name={color.id}
                id={color.id}
                class="w-1/2"
                bind:value={SETTINGS.ui[color.id]}
            />
        </li>
    {/each}
</ToolBox>

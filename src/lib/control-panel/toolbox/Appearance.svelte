<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import { appearanceData } from '$lib/static/control-panel-config.svelte';
    import { SETTINGS } from '$lib/static/graph-config.svelte';
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';
    import Select from '$lib/components/inputs/Select.svelte';
    import Color from '$lib/components/inputs/Color.svelte';
    import { UIID_TO_HANDLER } from '$lib/static/graph-ui-sync.svelte';

    /**
     * @param {string} type
     */
    function filterInput(type) {
        return appearanceData.filter((inp) => inp.type === type);
    }

    const styleCheckboxes = filterInput('checkbox');
    let selects = filterInput('select');
    selects.map((sel) => {
        // @ts-ignore
        const opts = [];
        sel.options?.forEach((opt) => opts.push({ value: opt, label: opt }));
        // @ts-ignore
        sel.options = opts;
    });
    const colors = filterInput('color');
</script>

<ToolBox legend="Appearance" direction="col">
    <li class="flex flex-row items-center gap-3">
        {#each styleCheckboxes as checkbox}
            <CheckBox
                bind:checked={SETTINGS.ui[checkbox.id]}
                onchange={UIID_TO_HANDLER[checkbox.id]}
                label={checkbox.label}
            />
        {/each}
    </li>
    {#each selects as select}
        <li class="flex flex-row items-center justify-between gap-3">
            <Select
                bind:value={SETTINGS.ui[select.id]}
                onchange={UIID_TO_HANDLER[select.id]}
                options={select.options}
                label={select.label}
            />
        </li>
    {/each}
    {#each colors as color}
        <li class="flex flex-row items-center justify-between gap-3">
            <Color
                bind:value={SETTINGS.ui[color.id]}
                onchange={UIID_TO_HANDLER[color.id]}
                label={color.label}
            />
        </li>
    {/each}
</ToolBox>

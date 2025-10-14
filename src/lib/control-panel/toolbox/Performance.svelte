<script>
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';
    import ToolBox from '$lib/components/ToolBox.svelte';
    import { performanceData } from '$lib/static/control-panel-config.svelte';
    import { SETTINGS } from '$lib/static/graph-config.svelte';
    import { UIID_TO_HANDLER } from '$lib/static/graph-ui-sync.svelte';
</script>

<ToolBox legend="Performance options" direction="col">
    <p class="text-center text-sm">
        We recommend enabling the following options for better performance with graphs with many
        vertices or edges. We also recommend using the haystack curve style for arc edges.
    </p>
    {#each performanceData as checkbox}
        <li>
            {#if checkbox.id === 'webgl'}
                <p class="text-center text-sm">
                    <span class="font-bold">Note:</span> rendering the nodes and edges using WebGL makes
                    the non-interactive. All elements of the graph will need to be generated using the
                    “Generate graph” section.
                </p>
            {/if}
            <CheckBox
                bind:checked={SETTINGS.ui[checkbox.id]}
                onchange={UIID_TO_HANDLER[checkbox.id]}
                label={checkbox.label}
            />
        </li>
    {/each}
</ToolBox>

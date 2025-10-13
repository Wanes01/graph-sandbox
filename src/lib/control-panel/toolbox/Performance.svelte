<script>
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';
    import ToolBox from '$lib/components/ToolBox.svelte';
    import { performanceData } from '$lib/static/control-panel-config.svelte';
    import { SETTINGS } from '$lib/static/graph-config.svelte';
</script>

<ToolBox legend="Performance options" direction="col">
    <p class="text-center text-sm">
        We recommend enabling the following options for better performance with graphs with many
        vertices or edges. We also recommend using the haystack curve style for arc edges.
    </p>
    {#each performanceData as checkbox}
        <li>
            <CheckBox bind:checked={SETTINGS.ui[checkbox.id]} label={checkbox.label} />
        </li>
    {/each}
</ToolBox>

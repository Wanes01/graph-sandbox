<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import QuickButton from '$lib/components/QuickButton.svelte';
    import { quickEditData } from '$lib/static/control-panel-config.svelte';
</script>

<ToolBox legend="Quick edit" direction="row">
    {#each quickEditData as quickButton}
        <li class="w-1/{quickEditData.length}">
            <QuickButton {...quickButton} />
        </li>
    {/each}
</ToolBox>

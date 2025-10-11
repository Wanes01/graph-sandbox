<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import QuickButton from '$lib/components/QuickButton.svelte';
    import { quickEditData } from '$lib/static/control-panel-config.svelte';
    import { cy } from '$lib/static/graph-config.svelte';

    function resetGraph() {}
</script>

<ToolBox legend="Quick edit" direction="row">
    <li class="flex w-full flex-col gap-2">
        <div class="flex w-full flex-row gap-2">
            {#each quickEditData as quickButton}
                <li class="w-1/{quickEditData.length}">
                    <QuickButton {...quickButton} />
                </li>
            {/each}
        </div>
        <button
            onclick={() => cy?.remove('*')}
            class="flex w-full cursor-pointer flex-row justify-center rounded-md border-b-3 border-b-red-800 bg-red-200 py-1 hover:bg-red-300 active:border-white active:bg-red-100 active:inset-shadow-sm active:inset-shadow-red-800"
        >
            <img src="/icons/bin.svg" alt="Delete graph" class="h-6" />
        </button>
    </li>
</ToolBox>

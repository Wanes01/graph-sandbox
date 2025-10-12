<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import Button from '$lib/components/inputs/Button.svelte';
    import QuickButton from '$lib/components/inputs/QuickButton.svelte';
    import ChoiceModal from '$lib/components/modals/ChoiceModal.svelte';
    import { quickEditData } from '$lib/static/control-panel-config.svelte';
    import { cy } from '$lib/static/graph-config.svelte';

    let showDeleteModal = $state(false);
</script>

<ToolBox legend="Quick edit" direction="row">
    <li class="flex w-full flex-col gap-2">
        <div class="flex w-full flex-row gap-2">
            {#each quickEditData as quickButton}
                <li class="flex-1">
                    <QuickButton {...quickButton} />
                </li>
            {/each}
        </div>
        <Button onclick={() => (showDeleteModal = true)} color="red">
            <img src="/icons/bin.svg" alt="Delete graph" class="h-5" />
        </Button>
    </li>
</ToolBox>

{#if showDeleteModal}
    <ChoiceModal
        text="Are you sure you want to delete the graph?"
        leftColor="green"
        leftText="Yes"
        leftOnClick={() => {
            cy?.remove('*');
            showDeleteModal = false;
        }}
        rightColor="red"
        rightText="No"
        rightOnClick={() => (showDeleteModal = false)}
    />
{/if}

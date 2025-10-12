<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import Button from '$lib/components/inputs/Button.svelte';
    import NumberInput from '$lib/components/inputs/NumberInput.svelte';
    import { generateVertices } from '$lib/static/graph-generate.svelte';

    /**
     * @type {number}
     */
    let val;
</script>

<ToolBox legend="Generate graph" direction="col" openOnMount={true}>
    <div class="flex w-full flex-row items-end gap-2">
        <NumberInput label="Vertices" min={1} max={100} step={1} bind:value={val} />
        <div>
            <Button
                color="blue"
                onclick={() => {
                    generateVertices(val);
                }}
            >
                <span>Generate</span>
            </Button>
        </div>
    </div>
</ToolBox>

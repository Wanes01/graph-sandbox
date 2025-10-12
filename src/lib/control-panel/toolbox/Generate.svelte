<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import Button from '$lib/components/inputs/Button.svelte';
    import NumberInput from '$lib/components/inputs/NumberInput.svelte';
    import Select from '$lib/components/inputs/Select.svelte';
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';
    import { edgeGenerationData } from '$lib/static/control-panel-config.svelte';
    import {
        EDGE_GENERATION_METHODS,
        applyEdgeGen,
        generateVertices
    } from '$lib/static/graph-generate.svelte';

    /**
     * @type {number | null}
     */
    let vertices = $state(null);
    /**
     * @type {boolean | null}
     */
    let labelVertices = $state(null);
    /**
     * @type {string | null}
     */
    let edgeType = $state(null);

    const edgeTypeOptions = edgeGenerationData.map((type) => {
        return {
            label: type.label,
            value: type.type
        };
    });

    const edgeGenerationOptions = Object.entries(EDGE_GENERATION_METHODS).map(([genType, data]) => {
        return {
            label: data.label,
            value: genType
        };
    });

    let selectedEdgeMethod = $state(null);

    /**
     * @type {boolean}
     */
    let selfLoops = $state(false);

    /**
     * @type {number}
     */
    let probability = $state(0.01);

    /**
     * @type {any}
     */
    const edgeFunctionInput = $derived({
        edgeType: edgeType,
        selfLoops: selfLoops,
        p: probability
    });
</script>

<ToolBox legend="Generate graph" direction="col" openOnMount={true}>
    <!-- VERTICES GENERATION -->
    <div class="flex flex-col gap-3">
        <div class="flex w-full flex-row items-end gap-2">
            <div class="w-1/2">
                <NumberInput label="Vertices" min={1} max={100} step={1} bind:value={vertices} />
            </div>
            <div class="w-1/2">
                <CheckBox label="Label vertices" bind:checked={labelVertices} />
            </div>
        </div>
        <Button
            color="blue"
            onclick={() => {
                generateVertices(vertices || 0, labelVertices || false);
            }}
        >
            <span>Generate vertices</span>
        </Button>
    </div>

    <!-- SEPARATOR -->
    <div class="my-3 border border-slate-300"></div>

    <!-- EDGE GENERATION -->
    <Select label={'Edge type'} options={edgeTypeOptions} bind:value={edgeType} />
    <Select
        label={'Edge generation method'}
        options={edgeGenerationOptions}
        bind:value={selectedEdgeMethod}
    />
    {#if selectedEdgeMethod === EDGE_GENERATION_METHODS.PROBABILITY.id}
        <NumberInput label="Probability" min={0.01} max={1} step={0.01} bind:value={probability} />
    {/if}
    <div class="my-1">
        <CheckBox label={'Allow self-loops'} bind:checked={selfLoops} />
    </div>
    <Button
        color="blue"
        onclick={() => {
            if (selectedEdgeMethod && edgeType) {
                // @ts-ignore
                const fn = EDGE_GENERATION_METHODS[selectedEdgeMethod].fn;
                applyEdgeGen(fn, edgeFunctionInput);
            }
        }}
    >
        <span>Generate edges</span>
    </Button>
</ToolBox>

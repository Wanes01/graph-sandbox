<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import Button from '$lib/components/inputs/Button.svelte';
    import NumberInput from '$lib/components/inputs/NumberInput.svelte';
    import Select from '$lib/components/inputs/Select.svelte';
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';
    import Separator from '$lib/components/misc/Separator.svelte';
    import { edgeGenerationData } from '$lib/static/control-panel-config.svelte';
    import {
        EDGE_GENERATION_METHODS,
        applyEdgeGen,
        generateVertices
    } from '$lib/static/graph-generate.svelte';
    import { SETTINGS } from '$lib/static/graph-config.svelte';

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
    let probability = $state(SETTINGS.generation.minP);

    /**
     *
     */
    let couples = $state(0);

    /**
     * @type {any}
     */
    const edgeFunctionInput = $derived({
        edgeType: edgeType,
        selfLoops: selfLoops,
        p: probability,
        couples: couples
    });

    const maxEdgesInput = (SETTINGS.generation.maxNodes * (SETTINGS.generation.maxNodes - 1)) / 2;
</script>

<ToolBox legend="Generate graph" direction="col" openOnMount={true}>
    <!-- VERTICES GENERATION -->
    <div class="flex flex-col gap-3">
        <div class="flex w-full flex-row items-end gap-2">
            <div class="w-1/2">
                <NumberInput
                    label="Vertices"
                    min={1}
                    max={SETTINGS.generation.maxNodes}
                    step={1}
                    bind:value={vertices}
                />
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
    <Separator />

    <!-- EDGE GENERATION -->
    <Select label={'Edge type'} options={edgeTypeOptions} bind:value={edgeType} />
    <Select
        label={'Edge generation method'}
        options={edgeGenerationOptions}
        bind:value={selectedEdgeMethod}
    />

    {#if selectedEdgeMethod === EDGE_GENERATION_METHODS.PROBABILITY.id}
        <NumberInput
            label="Probability to connect every two edges"
            min={SETTINGS.generation.minP}
            max={1}
            step={SETTINGS.generation.minP}
            bind:value={probability}
        />
    {:else if selectedEdgeMethod === EDGE_GENERATION_METHODS.NCOUPLES.id}
        <NumberInput
            label="Number of total edges"
            min={1}
            max={maxEdgesInput}
            step={1}
            bind:value={couples}
        />
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

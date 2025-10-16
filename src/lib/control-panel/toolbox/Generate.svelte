<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import Button from '$lib/components/inputs/Button.svelte';
    import NumberInput from '$lib/components/inputs/NumberInput.svelte';
    import Select from '$lib/components/inputs/Select.svelte';
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';
    import Separator from '$lib/components/misc/Separator.svelte';
    import SlidingBox from '$lib/components/misc/SlidingBox.svelte';
    import { edgeGenerationData } from '$lib/static/control-panel-config.svelte';
    import {
        EDGE_GENERATION_METHODS,
        applyEdgeGen,
        generateVertices
    } from '$lib/static/graph-generate.svelte';
    import { cy, EDGE_TYPES, SETTINGS } from '$lib/static/graph-config.svelte';
    import { UIID_TO_HANDLER } from '$lib/static/graph-ui-sync.svelte';

    /**
     * @type {number | null}
     */
    let vertices = $state(null);
    /**
     * @type {symbol | null}
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
     * @type {number}
     */
    let couples = $state(0);

    /**
     * @type {boolean}
     */
    let weighted = $state(false);

    /**
     * @type {boolean}
     */
    let infinityValues = $state(false);

    /**
     * @type {number}
     */
    let minWeight = $state(0);

    /**
     * @type {number}
     */
    let maxWeight = $state(0);

    /**
     * @type {number}
     */
    let weightVariation = $state(0);

    /**
     * @type {number | undefined}
     */
    let maxDegree = $state(undefined);

    /**
     * @type {number | undefined}
     */
    let maxIndegree = $state(undefined);

    /**
     * @type {number | undefined}
     */
    let maxOutdegree = $state(undefined);

    /**
     * @type {any}
     */
    const edgeFunctionInput = $derived({
        edgeType: edgeType,
        selfLoops: selfLoops,
        p: probability,
        couples: couples,
        weighted: weighted,
        minWeight: minWeight,
        maxWeight: maxWeight,
        weightVariation: weightVariation,
        maxDegree: maxDegree,
        maxIndegree: maxIndegree,
        maxOutdegree: maxOutdegree
    });

    const MAX_WEIGHT = 10000;
    const MIN_WEIGHT = -MAX_WEIGHT;

    const maxEdgesInput = (SETTINGS.generation.maxNodes * (SETTINGS.generation.maxNodes - 1)) / 2;
</script>

<ToolBox legend="Generate graph" direction="col" openOnMount={true}>
    <!-- VERTICES GENERATION -->
    <div class="flex flex-col gap-3">
        <NumberInput
            label="Vertices"
            min={1}
            max={SETTINGS.generation.maxNodes}
            step={1}
            spinner={true}
            bind:value={vertices}
        />
        <Button
            color="blue"
            onclick={() => {
                generateVertices(vertices || 0);
            }}
        >
            <span>Generate vertices</span>
        </Button>
    </div>

    <!-- SEPARATOR -->
    <Separator />

    <!-- EDGE GENERATION -->
    <Select
        label={'Edge type'}
        options={edgeTypeOptions}
        bind:value={edgeType}
        def={EDGE_TYPES.UNDIRECTED}
    />

    <Select
        label={'Edge generation method'}
        options={edgeGenerationOptions}
        bind:value={selectedEdgeMethod}
    />

    <div class="flex flex-col gap-2">
        {#if selectedEdgeMethod && EDGE_GENERATION_METHODS[selectedEdgeMethod].degreeAllowed}
            {#if edgeType === EDGE_TYPES.UNDIRECTED}
                <SlidingBox>
                    <NumberInput
                        spinner={true}
                        label="Max degree (blank if none)"
                        blankAllowed={true}
                        min={1}
                        max={SETTINGS.generation.maxNodes - 1}
                        step={1}
                        bind:value={maxDegree}
                    />
                </SlidingBox>
            {:else}
                <SlidingBox dir={'col'} gap={2}>
                    <NumberInput
                        spinner={true}
                        label="Max in-degree (blank if none)"
                        blankAllowed={true}
                        min={1}
                        max={SETTINGS.generation.maxNodes - 1}
                        step={1}
                        bind:value={maxIndegree}
                    />
                    <NumberInput
                        spinner={true}
                        label="Max out-degree (blank if none)"
                        blankAllowed={true}
                        min={1}
                        max={SETTINGS.generation.maxNodes - 1}
                        step={1}
                        bind:value={maxOutdegree}
                    />
                </SlidingBox>
            {/if}
        {/if}
    </div>

    {#if selectedEdgeMethod === EDGE_GENERATION_METHODS.PROBABILITY.id}
        <SlidingBox>
            <NumberInput
                label="Probability to connect every two edges"
                placeholder={'0.001 <= p <= 1'}
                spinner={true}
                min={SETTINGS.generation.minP}
                max={1}
                step={SETTINGS.generation.minP}
                bind:value={probability}
            />
        </SlidingBox>
    {:else if selectedEdgeMethod === EDGE_GENERATION_METHODS.NCOUPLES.id}
        <SlidingBox>
            <NumberInput
                label="Number of total edges"
                spinner={true}
                min={1}
                max={maxEdgesInput}
                step={1}
                bind:value={couples}
            />
        </SlidingBox>
    {:else if selectedEdgeMethod === EDGE_GENERATION_METHODS.STAR.id}
        <SlidingBox>
            <NumberInput
                label="Star id (blank to pick a random vertex)"
                spinner={true}
                min={1}
                max={cy?.nodes().length}
                step={1}
                blankAllowed={true}
                bind:value={couples}
            />
        </SlidingBox>
    {/if}

    <div class="my-1 flex flex-col gap-2">
        <CheckBox label={'Allow self-loops'} bind:checked={selfLoops} />
        <CheckBox label={'Weighted'} bind:checked={weighted} />
    </div>
    {#if weighted}
        <SlidingBox>
            <NumberInput
                label="Weight min. variation"
                spinner={true}
                min={0.01}
                max={1}
                step={0.01}
                def={1}
                bind:value={weightVariation}
            />
            <NumberInput
                label="Min. weight"
                spinner={true}
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                step={1}
                def={1}
                bind:value={minWeight}
            />
            <NumberInput
                label="Max. weight"
                spinner={true}
                min={MIN_WEIGHT}
                max={MAX_WEIGHT}
                step={1}
                def={100}
                bind:value={maxWeight}
            />
            <CheckBox label={'Infinity weights allowed'} bind:checked={infinityValues} />
            {#if infinityValues}
                <p>Select con tipo e probabilitià</p>
            {/if}
        </SlidingBox>
    {/if}

    <Button
        color="blue"
        onclick={() => {
            /* user must select at least the edge generation method and type of edge */
            if (!selectedEdgeMethod || !edgeType) {
                return;
            }
            /* if user wants the edges to be weighted then minWeight must be <= maxWeight*/
            if (weighted && minWeight > maxWeight) {
                return;
            }
            /* turns on weight visualization automatically */
            if (weighted) {
                SETTINGS.ui['show-weights'] = true;
                UIID_TO_HANDLER['show-weights']();
            }
            /* fixes degree sync when switching from a graph type to another */
            const degAllowed = EDGE_GENERATION_METHODS[selectedEdgeMethod].degreeAllowed;
            if (!degAllowed || edgeType === EDGE_TYPES.UNDIRECTED) {
                maxIndegree = undefined;
                maxOutdegree = undefined;
            }
            if (!degAllowed || edgeType !== EDGE_TYPES.UNDIRECTED) {
                maxDegree = undefined;
            }
            console.table(edgeFunctionInput);
            // @ts-ignore
            const fn = EDGE_GENERATION_METHODS[selectedEdgeMethod].fn;
            applyEdgeGen(fn, edgeFunctionInput);
        }}
    >
        <span>Generate edges</span>
    </Button>
</ToolBox>

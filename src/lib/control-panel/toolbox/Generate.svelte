<script>
    import ToolBox from '$lib/components/ToolBox.svelte';
    import Button from '$lib/components/inputs/Button.svelte';
    import NumberInput from '$lib/components/inputs/NumberInput.svelte';
    import Select from '$lib/components/inputs/Select.svelte';
    import CheckBox from '$lib/components/inputs/CheckBox.svelte';
    import { generateVertices } from '$lib/static/graph-generate.svelte';
    import { edgeGenerationData } from '$lib/static/control-panel-config.svelte';
    import { edgeGenerationMethods } from '$lib/static/graph-generate.svelte';

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

    const edgeGenerationOptions = edgeGenerationMethods.map((method) => {
        return {
            label: method.label,
            value: method.label
        };
    });

    let edgeGenerationMethod = $state(null);

    /**
     * @type {boolean}
     */
    let selfLoops = $state(false);
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
        bind:value={edgeGenerationMethod}
    />
    <div class="my-1">
        <CheckBox label={'Allow self-loops'} bind:checked={selfLoops} />
    </div>
    <Button color="blue" onclick={() => {}}>
        <span>Generate edges</span>
    </Button>
</ToolBox>

<script>
    // executes code only after the graph element is mounted on the DOM
    import { onMount } from 'svelte';
    import { initializeGraph, getGraphInitConfig, SETTINGS } from '$lib/static/graph-config.svelte';
    import { initializeGraphListeners } from '$lib/static/graph-listeners.svelte';
    import { initUISync } from '$lib/static/graph-ui-sync.svelte';

    let { width } = $props();

    /** @type {any} */
    let container;

    onMount(() => {
        // @ts-ignore
        SETTINGS.domElement = container;
        initializeGraph(getGraphInitConfig());
        initializeGraphListeners();
        initUISync();
    });
</script>

<div bind:this={container} class="graph relative h-screen" style="width: {width}"></div>

<script>
    // executes code only after the graph element is mount on the DOM
    import { onMount } from 'svelte';
    import { SETTINGS, initializeGraph } from '$lib/static/graph-config.svelte';
    import { initializeGraphListeners } from '$lib/static/graph-listeners.svelte';
    import { initUISync } from '$lib/static/graph-ui-sync.svelte';
    import cytoscape from 'cytoscape';

    let { width } = $props();

    /** @type {any} */
    let container;

    onMount(() => {
        const cy = cytoscape({
            container: container,

            elements: [
                { data: { id: 'a', label: 'Nodo A', status: 'normal' } },
                { data: { id: 'b', label: 'Nodo B', status: 'normal' } },
                { data: { id: 'c', label: 'Nodo C', status: 'normal' } },
                { data: { id: 'ab', source: 'a', target: 'b', weight: 0, symbolicWeight: '0' } },
                { data: { id: 'bc', source: 'b', target: 'c', weight: 0, symbolicWeight: '0' } },
                { data: { id: 'ca', source: 'c', target: 'a', weight: 0, symbolicWeight: '0' } }
            ],

            layout: { name: SETTINGS.ui.layout },

            style: [
                {
                    selector: 'node',
                    style: {
                        backgroundColor: SETTINGS.ui['vertex-color']
                    }
                },
                {
                    selector: 'node[label]',
                    style: {
                        'background-color': SETTINGS.ui['vertex-color'],
                        label: 'data(label)',
                        color: 'white',
                        'text-valign': 'center',
                        'text-outline-color': SETTINGS.ui['vertex-color'],
                        'text-outline-width': 2,
                        'text-opacity': 1
                    }
                },
                {
                    selector: 'node[status = "begin-link"]',
                    style: {
                        'background-color': '#eb7d34'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        width: 2,
                        'line-color': SETTINGS.ui['edge-color'],
                        'target-arrow-color': SETTINGS.ui['edge-color'],
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'font-size': 16
                    }
                },
                {
                    selector: 'edge[symbolicWeight = "∞"], edge[symbolicWeight = "-∞"]',
                    style: {
                        'font-size': 30
                    }
                }
            ]
        });
        // @ts-ignore
        initializeGraph(cy, container);
        initializeGraphListeners();
        initUISync();
    });
</script>

<div bind:this={container} class="graph relative h-screen" style="width: {width}"></div>

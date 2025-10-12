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

            maxZoom: 3,

            style: [
                {
                    selector: 'node',
                    style: {
                        backgroundColor: SETTINGS.ui['vertex-color']
                    }
                },
                // nodes that have a label to show
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
                // node clicked to create an edge
                {
                    selector: 'node[status = "begin-link"]',
                    style: {
                        'background-color': '#eb7d34',
                        'text-outline-color': '#eb7d34'
                    }
                },

                {
                    selector: 'edge',
                    style: {
                        width: 2,
                        'line-color': SETTINGS.ui['edge-color'],
                        'target-arrow-color': SETTINGS.ui['edge-color'],
                        'target-arrow-shape': SETTINGS.ui['arrow-shape'],
                        'arrow-scale': 1.8,
                        'curve-style': 'bezier',
                        'font-size': 16
                    }
                },
                // edges with infinity weights
                {
                    selector: 'edge[symbolicWeight = "∞"], edge[symbolicWeight = "-∞"]',
                    style: {
                        'font-size': 30
                    }
                },
                // unidirectional edges
                {
                    selector: 'edge[type="unidir"]',
                    style: {}
                },
                /* bidirectional edges. When a bidirectional edge is created,
                    two edges are created: a bidir and a hidden one.
                    Only the bidir arc is shown. The two arcs must be referenced
                    to each other via a field in edge.data(...).
                    This is done because only unidirectional arcs can be represented
                    in cytoscape.js 
                */
                {
                    selector: 'edge[type="bidir"]',
                    style: {
                        'source-arrow-shape': SETTINGS.ui['arrow-shape'],
                        'source-arrow-color': SETTINGS.ui['edge-color']
                    }
                },
                {
                    selector: 'edge[type="hidden"]',
                    style: {
                        display: 'none'
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

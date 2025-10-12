import { LAYOUTS, SETTINGS, cy } from "./graph-config.svelte";

export function initUISync() {
    /**
     * Changes layout on user input.
     */
    $effect(() => {
        const layoutObj = LAYOUTS.find(l => l.name === SETTINGS.ui['layout']);
        // @ts-ignore
        cy?.layout(layoutObj).run();
    });

    /**
     * Compute layout on add/remove graph operations.
     * Sets a timeout run a single layout update
     * for multiple close operations.
     * @type {NodeJS.Timeout | null}
     */
    let layoutTimeout = null;
    const LAYOUT_DELAY = 150;
    cy?.on('add remove', 'node, edge', () => {
        clearTimeout(layoutTimeout ?? undefined);
        layoutTimeout = setTimeout(() => {
            cy?.layout({ name: SETTINGS.ui.layout }).run();
        }, LAYOUT_DELAY);
    });

    /**
     * Hide / shows weight labels on user input.
     */
    $effect(() => {
        cy?.style().selector('edge').style({
            'label': SETTINGS.ui['show-weights'] ? 'data(symbolicWeight)' : ''
        }).update();
    });

    /**
     * Hide / shows node labels on user input.
     */
    $effect(() => {
        cy?.style().selector('node[label]').style({
            'text-opacity': SETTINGS.ui['show-labels'] ? 1 : 0
        }).update();
    });

    /**
     * Changes vertices color on user input.
     */
    $effect(() => {
        ['node', 'node[label]'].forEach(sel => {
            cy?.style()
                /* Excludes the restyle of all nodes that don't have the normal status:
                every special status must have its own vertex color  */
                .selector(sel + '[status = "normal"]')
                .style({
                    'background-color': SETTINGS.ui['vertex-color'],
                    'text-outline-color': SETTINGS.ui['vertex-color']
                })
                .update();
        });

        const complementary = complementaryColor(SETTINGS.ui['vertex-color']);

        cy?.style()
            .selector('node[status = "begin-link"]')
            .style({
                'background-color': complementary,
                'text-outline-color': complementary
            })
            .update();

        /**
         * @param {string} hex
         */
        function complementaryColor(hex) {
            // Removes the #
            const cleanHex = hex.replace('#', '');

            // extracts the R G B components
            const r = parseInt(cleanHex.slice(0, 2), 16);
            const g = parseInt(cleanHex.slice(2, 4), 16);
            const b = parseInt(cleanHex.slice(4, 6), 16);

            // computes the complementary color
            const compR = (255 - r).toString(16).padStart(2, '0');
            const compG = (255 - g).toString(16).padStart(2, '0');
            const compB = (255 - b).toString(16).padStart(2, '0');

            // builds the final hex
            return `#${compR}${compG}${compB}`.toUpperCase();
        }
    });

    /**
     * Changes edges color on user input.
     */
    $effect(() => {
        cy?.style().selector('edge').style({
            'line-color': SETTINGS.ui['edge-color'],
            'target-arrow-color': SETTINGS.ui['edge-color']
        }).selector('edge[type="bidir"]').style({
            'source-arrow-color': SETTINGS.ui['edge-color']
        }).update();
    });

    /**
     * Changes edges arrow type.
     */
    $effect(() => {
        cy?.style().selector('edge').style({
            'target-arrow-shape': SETTINGS.ui['arrow-shape']
        }).selector('edge[type="bidir"]').style({
            'source-arrow-shape': SETTINGS.ui['arrow-shape']
        }).update();
    })

    /**
     * Changes curve style of edges.
     */
    $effect(() => {
        cy?.style().selector('edge').style({
            'curve-style': SETTINGS.ui['curve-style']
        }).update();
    });
}
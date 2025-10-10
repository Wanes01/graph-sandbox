import { SETTINGS, cy } from "./graph-config.svelte";

export function initUISync() {
    /**
     * Changes layout on user input.
     */
    $effect(() => {
        cy?.layout({ name: SETTINGS.ui['layout'] }).run();
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
            cy?.style().selector(sel).style({
                'background-color': SETTINGS.ui['vertex-color'],
                'text-outline-color': SETTINGS.ui['vertex-color']
            }).update();
        });
    });

    /**
     * Changes edges color on user input.
     */
    $effect(() => {
        cy?.style().selector('edge').style({
            'line-color': SETTINGS.ui['edge-color'],
            'target-arrow-color': SETTINGS.ui['edge-color']
        }).update();
    });
}
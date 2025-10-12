import { EDIT_MODES, SETTINGS, GRAPH_DATA, historyManager, cy } from '$lib/static/graph-config.svelte';
import { generateEdge } from './graph-generate.svelte';
import { editElementLabel } from './label-editing.svelte';

export function initializeGraphListeners() {
    /**
     * Background click event.
     * Adds a node if the right mode is selected
     */
    cy?.on('click', function (e) {
        if (e.target !== cy) {
            return;
        }

        if (SETTINGS.selectedNode) {
            // @ts-ignore
            SETTINGS.selectedNode.data('status', 'normal');
            SETTINGS.selectedNode = null;
        }

        if (SETTINGS.editMode === EDIT_MODES.ADD_VERTEX) {
            const pos = e.position;
            GRAPH_DATA.nodes++;

            cy?.add({
                group: 'nodes',
                data: { id: GRAPH_DATA.nodes.toString(), status: 'normal' },
                position: { x: pos.x, y: pos.y }
            })
            // ?. => shorthand. Doesn't execute it if hm is null.
            historyManager?.save();
        }
    });

    /**
     * Double click node / edge event.
     * Edits node's label / edge weight.
     */
    let lastClickTime = 0;
    /**
     * @type {import('cytoscape').NodeSingular | null}
     */
    let lastElementClicked = null;
    const doubleClickDelay = 200; //ms
    cy?.on('tap', 'node, edge', function (e) {
        const now = new Date().getTime();
        if (now - lastClickTime < doubleClickDelay
            && e.target === lastElementClicked
        ) {
            editElementLabel(e.target, e.target.isNode && e.target.isNode());
            historyManager?.save();
        }
        lastClickTime = now;
        lastElementClicked = e.target;
    });

    /**
 * Handles adding an edge (uni- or bi-directional) depending on the edit mode.
 */
    cy?.on('tap', 'node', function (e) {
        const mode = SETTINGS.editMode;

        // @ts-ignore
        if (![EDIT_MODES.ADD_EDGE, EDIT_MODES.ADD_DOUBLE_EDGE].includes(mode)) {
            return;
        }

        // Changes the style of the first node to link
        if (!SETTINGS.selectedNode) {
            SETTINGS.selectedNode = e.target;
            SETTINGS.selectedNode?.data('status', 'begin-link');
            return;
        }

        // User clicked two nodes. Creates the edge.
        const src = SETTINGS.selectedNode;
        const dst = e.target;

        generateEdge(src, dst, SETTINGS.editMode === EDIT_MODES.ADD_DOUBLE_EDGE);

        // Resets the first node style
        SETTINGS.selectedNode.data('status', 'normal');
        SETTINGS.selectedNode = null;
        historyManager?.save();
    });


    /**
     * Deletes a node / an edge
     */
    cy?.on('tap', 'node, edge', function (e) {
        if (SETTINGS.editMode === EDIT_MODES.ERASER) {
            const elem = e.target;
            // Deletes the hidden edge if its a bidirectional edge
            if (elem.isEdge && elem.isEdge() && elem.data('pairId')) {
                const hiddenEdge = cy?.getElementById(elem.data('pairId'));
                hiddenEdge?.remove();
            }
            elem.remove();
            historyManager?.save();
        }
    });

    /**
     * Undo / redo the last operation performed on the graph.
     */
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            historyManager?.undo();
            return;
        }

        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            historyManager?.redo();
            return;
        }
    });
}
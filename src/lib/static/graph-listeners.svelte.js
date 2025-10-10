import { EDIT_MODES, SETTINGS, GRAPH_DATA, historyManager, cy } from '$lib/static/graph-config.svelte';
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
                data: { id: GRAPH_DATA.nodes.toString() },
                position: { x: pos.x, y: pos.y },
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
     * Adds an edge / double edge
     */
    cy?.on('tap', 'node', function (e) {
        if (SETTINGS.editMode !== EDIT_MODES.ADD_EDGE
            && SETTINGS.editMode !== EDIT_MODES.ADD_DOUBLE_EDGE
        ) {
            return;
        }

        // selectes the first node to link
        if (!SETTINGS.selectedNode) {
            SETTINGS.selectedNode = e.target;
            SETTINGS.selectedNode?.data('status', 'begin-link');
            return;
        }

        /**
         * Adds an edge from node src to dst.
         * @param {import('cytoscape').NodeSingular} src 
         * @param {import('cytoscape').NodeSingular} dst 
         */
        function addEdge(src, dst) {
            GRAPH_DATA.edges++;
            cy?.add({
                group: 'edges',
                data: {
                    // id format: srcId-dstId#edgeNumber
                    id: `${src.id()}-${dst.id()}#${GRAPH_DATA.edges}`,
                    source: src.id(),
                    target: dst.id(),
                    weight: 0,
                    symbolicWeight: "0"
                }
            });
        }

        const src = SETTINGS.selectedNode;
        const dst = e.target;

        addEdge(src, dst);
        // adds the second arc to make the connection bidirectional
        if (SETTINGS.editMode === EDIT_MODES.ADD_DOUBLE_EDGE) {
            addEdge(dst, src);
        }

        SETTINGS.selectedNode.data('status', 'normal');
        SETTINGS.selectedNode = null;
        historyManager?.save();
    });

    /**
     * Deletes a node / an edge
     */
    cy?.on('tap', 'node, edge', function (e) {
        if (SETTINGS.editMode === EDIT_MODES.ERASER) {
            e.target.remove();
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
import { GRAPH_DATA, cy, historyManager } from "./graph-config.svelte"

/**
 * @param {number} vertNum
 */
export function generateVertices(vertNum) {
    for (let i = 0; i < vertNum; i++) {
        GRAPH_DATA.nodes++;
        cy?.add({
            group: 'nodes',
            data: {
                id: GRAPH_DATA.nodes.toString(),
                status: 'normal',
                label: `V#${GRAPH_DATA.nodes}`
            }
        });
    }
    historyManager?.save();
}
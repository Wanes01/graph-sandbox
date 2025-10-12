import { GRAPH_DATA, cy, historyManager } from "./graph-config.svelte"

export const edgeGenerationMethods = [
    {
        label: 'Probability',
        function: null
    },
    {
        label: 'N random couples',
        function: null
    }
]

/**
 * @param {number} vertNum
 * @param {boolean} giveLabel
 */
export function generateVertices(vertNum, giveLabel) {
    for (let i = 0; i < vertNum; i++) {
        GRAPH_DATA.nodes++;
        cy?.add({
            group: 'nodes',
            data: {
                id: GRAPH_DATA.nodes.toString(),
                status: 'normal',
                label: giveLabel ? `V#${GRAPH_DATA.nodes}` : ''
            }
        });
    }
    historyManager?.save();
}

/**
 * 
 * @param {import("cytoscape").NodeSingular} src 
 * @param {import("cytoscape").NodeSingular} dst 
 * @param {boolean} bidir 
 */
export function generateEdge(src, dst, bidir) {
    const edgeCount = ++GRAPH_DATA.edges;

    // Creates a unidirectional edge
    if (!bidir) {
        cy?.add({
            group: 'edges',
            data: {
                id: `${src.id()}-${dst.id()}#${edgeCount}`,
                source: src.id(),
                target: dst.id(),
                weight: 0,
                symbolicWeight: "0",
                type: 'unidir'
            }
        });

        // Creates two edges to emulate a bidirectional edge
    } else {
        const id1 = `${src.id()}-${dst.id()}#${edgeCount}`;
        const id2 = `${dst.id()}-${src.id()}#${edgeCount}`;

        cy?.add([
            {
                group: 'edges',
                data: {
                    id: id1,
                    pairId: id2,
                    source: src.id(),
                    target: dst.id(),
                    weight: 0,
                    symbolicWeight: "0",
                    type: 'bidir'
                }
            },
            {
                group: 'edges',
                data: {
                    id: id2,
                    pairId: id1,
                    source: dst.id(),
                    target: src.id(),
                    weight: 0,
                    symbolicWeight: "0",
                    type: 'hidden'
                }
            }
        ]);
    }
}

/**
 * 
 * @param {number} p 0 < prob <= 1
 */
export function generateEdgeByProbability(p) {
    const ids = cy?.nodes().map(node => node.id());

    if (!ids) {
        return;
    }

    for (let i = 0; i < ids?.length; i++) {

    }
}
import { SETTINGS, EDGE_TYPES, cy, historyManager } from "./graph-config.svelte"
import { changeLayout } from "./graph-ui-sync.svelte";

export const EDGE_GENERATION_METHODS = {
    PROBABILITY: {
        label: 'Probability',
        fn: generateEdgeByProbability,
        id: 'PROBABILITY',
    },
    NCOUPLES: {
        label: 'N random couples',
        fn: testing,
        id: 'NCOUPLES'
    },
    FULLMESH: {
        label: 'Full mesh topology',
        fn: fullMeshTopology,
        id: 'FULLMESH'
    }
}

/**
 * 
 * @param {Function} fn 
 * @param {any} inp 
 */
export function applyEdgeGen(fn, inp) {
    cy?.remove('edge');
    fn(inp);
    historyManager?.save();
}

/**
 * @param {any} input
 */
function testing(input) {
    console.log(input);
}

/**
 * @param {number} vertNum
 * @param {boolean} giveLabel
 */
export function generateVertices(vertNum, giveLabel) {
    cy?.remove('node');
    /**
     * Batch operation to improve performances:
     * doesn't trigger update() after every node insertion.
     */
    cy?.batch(() => {
        for (let i = 0; i < vertNum; i++) {
            const id = cy?.nodes().length.toString();
            cy?.add({
                group: 'nodes',
                data: {
                    id: id,
                    status: 'normal',
                    label: giveLabel ? `V#${id}` : ''
                }
            });
        }
    });
    /**
     * For some reasons if the graph is rendered via WebGL
     * the layout of the nodes does't get updated after the
     * batch insertion.
     */
    if (SETTINGS.ui.webgl) {
        changeLayout();
    }
    historyManager?.save();
}

/**
 * 
 * @param {string} srcId
 * @param {string} dstId 
 * @param {boolean} bidir
 * 
 * @returns a list on objects representing the edges to add
 */
export function generateEdge(srcId, dstId, bidir) {
    const edgeCount = cy?.edges().length;
    const edges = [];

    // Creates a unidirectional edge
    if (!bidir) {
        edges.push({
            group: 'edges',
            data: {
                id: `${srcId}-${dstId}#${edgeCount}`,
                source: srcId,
                target: dstId,
                weight: 0,
                symbolicWeight: "0",
                type: 'unidir'
            }
        });

        // Creates two edges to emulate a bidirectional edge
    } else {
        const id1 = `${srcId}-${dstId}#${edgeCount}`;
        const id2 = `${dstId}-${srcId}#${edgeCount}`;

        edges.push(
            {
                group: 'edges',
                data: {
                    id: id1,
                    pairId: id2,
                    source: srcId,
                    target: dstId,
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
                    source: dstId,
                    target: srcId,
                    weight: 0,
                    symbolicWeight: "0",
                    type: 'hidden'
                }
            }
        );
    }
    return edges;
}

/**
 * @param {any} input
 */
function generateEdgeByProbability(input) {
    const [p, selfLoops, edgeType] = [input.p, input.selfLoops, input.edgeType];

    if (p <= 0 || p > 1) {
        return;
    }

    const ids = cy?.nodes().map(node => node.id());

    if (!ids) {
        return;
    }

    cy?.batch(() => {
        const edges = [];
        for (let i = 0; i < ids.length; i++) {
            for (let j = i; j < ids.length; j++) {
                if (!selfLoops && i == j) {
                    continue;
                }

                if (Math.random() < p) {
                    // creates the edge with probability p
                    const srcId = ids[i];
                    const dstId = ids[j];

                    const generated = generateEdge(srcId, dstId, edgeTypeToBoolean(edgeType));
                    edges.push(...generated);
                }
            }
        }

        // @ts-ignore
        cy?.add(edges);
    });

    console.log(cy?.edges().length);
}

/**
 * @param {symbol} edgeType
 */
function edgeTypeToBoolean(edgeType) {
    if (edgeType === EDGE_TYPES.MIXED) {
        return Math.random() < 0.5;
    }
    return edgeType === EDGE_TYPES.UNDIRECTED;
}

/**
 * @param {any} input
 */
function fullMeshTopology(input) {
    const [selfLoops, edgeType] = [input.selfLoops, input.edgeType];
    generateEdgeByProbability({
        p: 1,
        selfLoops: selfLoops,
        edgeType: edgeType
    });
}
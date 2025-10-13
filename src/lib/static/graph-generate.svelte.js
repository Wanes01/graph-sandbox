import { EDGE_TYPES, cy, historyManager } from "./graph-config.svelte"

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
    historyManager?.save();
}

/**
 * 
 * @param {string} srcId
 * @param {string} dstId 
 * @param {boolean} bidir 
 */
export function generateEdge(srcId, dstId, bidir) {
    const edgeCount = cy?.edges().length;

    // Creates a unidirectional edge
    if (!bidir) {
        cy?.add({
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

        cy?.add([
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
        ]);
    }
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

    for (let i = 0; i < ids.length; i++) {
        for (let j = i; j < ids.length; j++) {
            if (!selfLoops && i == j) {
                continue;
            }
            const guess = Math.random() * (1 - 0.01 + Number.EPSILON) + 0.01;
            if (guess > p) {
                continue;
            }
            // creates the edge with probability p
            const srcId = ids[i];
            const dstId = ids[j];

            generateEdge(srcId, dstId, edgeTypeToBoolean(edgeType))
        }
    }
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
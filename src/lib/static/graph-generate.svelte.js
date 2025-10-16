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
        fn: generateNCouples,
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
 * @param {function} fn
 * @param {any} inp 
 */
export function applyEdgeGen(fn, inp) {
    /* removes all edges */
    cy?.remove('edge');
    // @ts-ignore
    /* Applyes edge generation function */
    fn(inp);
    historyManager?.save();
}

/**
 * @param {any} input
 */
function generateNCouples(input) {
    const [
        couples,
        selfLoops,
        edgeType,
        maxDegree,
        maxIndegree,
        maxOutdegree
    ] = [input.couples, input.selfLoops, input.edgeType, input.maxDegree, input.maxIndegree, input.maxOutdegree];

    /** @type {string[] | undefined} */
    const ids = cy?.nodes().map(node => node.id());

    if (!ids) {
        return;
    }

    /**
     * @typedef {Object} Degree
     * @property {number} indeg - grado entrante
     * @property {number} outdeg - grado uscente
     */

    /** @type {Record<string, Degree>} */
    const degrees = {};
    ids.forEach(id => degrees[id] = {
        indeg: 0,
        outdeg: 0
    });


    cy?.batch(() => {
        const edges = [];
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        let idsSet = new Set(ids);
        while (edges.length < couples && idsSet.size > 0) {

            // if self loops are not allowed we need at least two different nodes
            if (!selfLoops && idsSet.size < 2) {
                break;
            }

            // array view of the set (used to generate the random indexes)
            const idsArray = Array.from(idsSet);
            const srcIndex = randomIntegerExcluded(idsArray.length);
            let dstIndex = randomIntegerExcluded(idsArray.length);
            if (!selfLoops) {
                while (dstIndex === srcIndex) {
                    dstIndex = randomIntegerExcluded(idsArray.length);
                }
            }

            const srcId = idsArray[srcIndex];
            const dstId = idsArray[dstIndex];

            // edge generation
            const bidir = edgeTypeToBoolean(edgeType);
            const weight = computeWeight(input);
            const generated = generateEdge(srcId, dstId, bidir, weight);
            edges.push(...generated);

            if (edgeType === EDGE_TYPES.UNDIRECTED) {
                degrees[srcId].outdeg++;
                degrees[dstId].outdeg++;
            } else {
                degrees[srcId].outdeg++;
                degrees[dstId].indeg++;
                if (bidir) {
                    degrees[srcId].indeg++;
                    degrees[dstId].outdeg++;
                }
            }

            /* removes the nodes that cannot be used anymore from the set */
            [srcId, dstId].forEach(id => {
                if (edgeType === EDGE_TYPES.UNDIRECTED) {
                    if (maxDegree !== undefined && degrees[id].outdeg >= maxDegree) {
                        idsSet.delete(id);
                    }
                } else {
                    if ((maxDegree !== undefined && degrees[id].outdeg + degrees[id].indeg >= maxDegree)
                        || (maxOutdegree !== undefined && degrees[id].outdeg >= maxOutdegree)
                        || (maxIndegree !== undefined && degrees[id].indeg >= maxIndegree)) {
                        idsSet.delete(id);
                    }
                }
            });
        }

        // @ts-ignore
        cy?.add(edges);
    });
}

/**
 * @param {number} num
 */
function randomIntegerExcluded(num) {
    return Math.floor(Math.random() * num);
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
 * @param {number} weight
 * 
 * @returns a list on objects representing the edges to add
 */
export function generateEdge(srcId, dstId, bidir, weight) {
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
                weight: weight,
                symbolicWeight: weight.toString(),
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
                    weight: weight,
                    symbolicWeight: weight.toString(),
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
                    weight: weight,
                    symbolicWeight: weight.toString(),
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
    const [
        p,
        selfLoops,
        edgeType,
        maxDegree,
        maxIndegree,
        maxOutdegree
    ] = [input.p, input.selfLoops, input.edgeType, input.maxDegree, input.maxIndegree, input.maxOutdegree];

    if (p <= 0 || p > 1) {
        return;
    }

    /** @type {string[] | undefined} */
    const ids = cy?.nodes().map(node => node.id());
    if (!ids) {
        return;
    }

    /**
     * @typedef {Object} Degree
     * @property {number} indeg - grado entrante
     * @property {number} outdeg - grado uscente
     */
    /** @type {Record<string, Degree>} */
    const degrees = {};
    ids.forEach(id => degrees[id] = {
        indeg: 0,
        outdeg: 0
    });

    cy?.batch(() => {
        const edges = [];

        for (let i = 0; i < ids.length; i++) {
            for (let j = i; j < ids.length; j++) {
                if (!selfLoops && i === j) {
                    continue;
                }

                const srcId = ids[i];
                const dstId = ids[j];

                // check if nodes can accept more edges based on edge type
                let canConnect = false;

                if (edgeType === EDGE_TYPES.UNDIRECTED) {
                    // undirected graph, checks only maxDegree
                    if (maxDegree !== undefined) {
                        canConnect = degrees[srcId].outdeg < maxDegree &&
                            degrees[dstId].outdeg < maxDegree;
                    } else {
                        canConnect = true;
                    }
                } else {
                    // directed or mixed graph
                    let srcCanSend = true;
                    let dstCanReceive = true;

                    if (maxOutdegree !== undefined) {
                        srcCanSend = degrees[srcId].outdeg < maxOutdegree;
                    }
                    if (maxIndegree !== undefined) {
                        dstCanReceive = degrees[dstId].indeg < maxIndegree;
                    }
                    if (maxDegree !== undefined) {
                        const srcDegree = degrees[srcId].indeg + degrees[srcId].outdeg;
                        const dstDegree = degrees[dstId].indeg + degrees[dstId].outdeg;
                        srcCanSend = srcCanSend && srcDegree < maxDegree;
                        dstCanReceive = dstCanReceive && dstDegree < maxDegree;
                    }

                    canConnect = srcCanSend && dstCanReceive;
                }

                if (!canConnect) {
                    continue;
                }

                // Creates the edge with probability p
                if (Math.random() < p) {
                    const bidir = edgeTypeToBoolean(edgeType);
                    const weight = computeWeight(input);
                    const generated = generateEdge(srcId, dstId, bidir, weight);
                    edges.push(...generated);

                    // Update degrees based on edge type
                    if (edgeType === EDGE_TYPES.UNDIRECTED) {
                        degrees[srcId].outdeg++;
                        degrees[dstId].outdeg++;
                    } else {
                        degrees[srcId].outdeg++;
                        degrees[dstId].indeg++;
                        if (bidir) {
                            degrees[srcId].indeg++;
                            degrees[dstId].outdeg++;
                        }
                    }
                }
            }
        }

        // @ts-ignore
        cy?.add(edges);
    });
}

/**
 * @param {any} input
 */
function computeWeight(input) {
    if (!input.weighted) {
        return 0;
    }
    const [minWeight, maxWeight, minVar] = [input.minWeight, input.maxWeight, input.weightVariation];
    const diff = Math.floor(Math.abs(maxWeight - minWeight));
    const variations = Math.ceil(diff / minVar);
    // integer between 0 and variantions (included)
    const offset = Math.floor(Math.random() * (variations + 1));
    const weight = minWeight + (offset * minVar);

    return roundTo(weight, countDecimals(minVar));
}

const roundTo = (/** @type {number} */ num, /** @type {number} */ n) => Math.round(num * 10 ** n) / 10 ** n;

/**
 * @param {number} num
 */
function countDecimals(num) {
    const str = num.toString();
    if (str.includes('.')) {
        return str.split('.')[1].length;
    }
    return 0;
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
    input.p = 1;
    generateEdgeByProbability(input);
}
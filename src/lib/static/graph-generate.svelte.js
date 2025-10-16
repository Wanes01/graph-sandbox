import { SETTINGS, EDGE_TYPES, cy, historyManager } from "./graph-config.svelte"
import { changeLayout } from "./graph-ui-sync.svelte";


/**
 * @typedef {Object} EdgeGenerationMethod
 * @property {string} label - Etichetta descrittiva da mostrare nell'interfaccia utente
 * @property {Function} fn - Funzione che implementa l'algoritmo di generazione degli archi
 * @property {string} id - Identificatore univoco del metodo
 * @property {boolean} degreeAllowed - Indica se per questa topologia ha senso limitare il grado dei nodi
 * @property {boolean} selfLoopAllowed
 */

/**
 * Metodi disponibili per la generazione degli archi nel grafo.
 * Ogni metodo definisce una strategia diversa per creare connessioni tra i nodi.
 * 
 * @type {Record<string, EdgeGenerationMethod>}
 * 
 * PROBABILITY - Genera archi con probabilità p tra ogni coppia di nodi (modello Erdős–Rényi)
 * NCOUPLES - Genera fino a N coppie di nodi connessi casualmente
 * FULLMESH - Genera una topologia a maglia completa (ogni nodo connesso a tutti gli altri)
 */
export const EDGE_GENERATION_METHODS = {
    PROBABILITY: {
        label: 'Probability',
        fn: generateEdgeByProbability,
        id: 'PROBABILITY',
        degreeAllowed: true,
        selfLoopAllowed: true
    },
    NCOUPLES: {
        label: 'N random couples',
        fn: generateNCouples,
        id: 'NCOUPLES',
        degreeAllowed: true,
        selfLoopAllowed: true
    },
    FULLMESH: {
        label: 'Full mesh topology',
        fn: fullMeshTopology,
        id: 'FULLMESH',
        degreeAllowed: false,
        selfLoopAllowed: false
    },
    STAR: {
        label: 'Star topology',
        fn: generateStar,
        id: 'STAR',
        degreeAllowed: false,
        selfLoopAllowed: false
    },
    TREE: {
        label: 'Tree topology',
        fn: generateTree,
        id: 'TREE',
        degreeAllowed: false,
        selfLoopAllowed: false
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
function generateStar(input) {
    const [
        edgeType,
        starId
    ] = [input.edgeType, input.starId];

    if (!cy?.nodes()) {
        return;
    }

    const idsLength = cy?.nodes().length;
    const star = starId !== undefined
        ? starId.toString()
        : randomIntegerExcluded(idsLength).toString();

    cy?.batch(() => {
        const edges = [];
        for (let dst = 0; dst < idsLength; dst++) {
            const dstId = dst.toString();
            if (dstId !== star) {
                const bidir = edgeTypeToBoolean(edgeType);
                const weight = computeWeight(input);
                const generated = generateEdge(star, dstId, bidir, weight);
                edges.push(...generated);
            }
        }
        // @ts-ignore
        cy?.add(edges);
    });
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
 */
export function generateVertices(vertNum) {
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
                    label: ''
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

/**
 * @typedef {Object} TREE_TYPE
 * @property {Object} RANDOM
 * @property {Object} NARY
 * @property {string} RANDOM.label
 * @property {symbol} RANDOM.value
 * @property {string} NARY.label
 * @property {symbol} NARY.value
 */
export const TREE_TYPE = {
    RANDOM: {
        value: Symbol("RANDOM"),
        label: "Random tree"
    },
    NARY: {
        value: Symbol("NARY"),
        label: "N-ary tree"
    },
}

/**
 * @typedef {Object} TREE_GROWTH
 * @property {Object} RANDOM
 * @property {Object} BREADTH
 * @property {Object} DEPTH
 * @property {string} RANDOM.label
 * @property {symbol} RANDOM.value
 * @property {string} BREADTH.label
 * @property {symbol} BREADTH.value
 * @property {string} DEPTH.label
 * @property {symbol} DEPTH.value
 */
export const TREE_GROWTH = {
    BREADTH: {
        value: Symbol("BREADTH"),
        label: "Breadth-first"
    },
    DEPTH: {
        value: Symbol("DEPTH"),
        label: "Depth-first"
    },
    RANDOM: {
        value: Symbol("RANDOM"),
        label: "Random growth"
    }
}

/**
 * Genera un albero considerando tipo, strategia di crescita e branching factor
 * @param {any} input
 */
function generateTree(input) {
    const {
        treeType = TREE_TYPE.RANDOM.value, // TREE_GEN.type.NARY o TREE_GEN.type.RANDOM
        growthStrategy = TREE_GROWTH.BREADTH.value, // TREE_GEN.growth.BREADTH, DEPTH, RANDOM
        minChildren = undefined, // opzionale, solo per treeType=RANDOM
        maxChildren, // obbligatorio
        rootSelection = undefined, // undefined (random) o numero (id del nodo)
        edgeType,
    } = input;

    /** @type {string[] | undefined} */
    const ids = cy?.nodes().map(node => node.id());
    if (!ids || ids.length === 0) {
        return;
    }

    // Validazione: maxChildren è obbligatorio
    if (maxChildren === undefined || maxChildren < 1) {
        console.error('maxChildren deve essere specificato e >= 1');
        return;
    }

    // Seleziona il nodo radice
    let rootId;
    if (rootSelection !== undefined) {
        // Verifica che l'id esista
        const selectedId = rootSelection.toString();
        if (ids.includes(selectedId)) {
            rootId = selectedId;
        } else {
            console.warn(`Nodo con id ${rootSelection} non trovato, uso radice casuale`);
            rootId = ids[randomIntegerExcluded(ids.length)];
        }
    } else {
        // Random
        rootId = ids[randomIntegerExcluded(ids.length)];
    }

    // Set dei nodi rimanenti da connettere
    const remaining = ids.filter(id => id !== rootId);

    // Coda/Stack per la crescita dell'albero
    const queue = [{ id: rootId, childrenCount: 0 }];

    cy?.batch(() => {
        const edges = [];

        while (remaining.length > 0 && queue.length > 0) {
            // Seleziona il prossimo padre in base alla strategia
            let parentIndex;
            if (growthStrategy === TREE_GROWTH.BREADTH.value) {
                parentIndex = 0; // FIFO - prende dal fronte
            } else if (growthStrategy === TREE_GROWTH.DEPTH.value) {
                parentIndex = queue.length - 1; // LIFO - prende dalla fine
            } else {
                // TREE_GEN.growth.RANDOM
                parentIndex = Math.floor(Math.random() * queue.length);
            }

            const parent = queue[parentIndex];

            // Determina quanti figli dare a questo nodo
            let numChildren;
            if (treeType === TREE_TYPE.NARY.value) {
                // N-ario: esattamente maxChildren (o quello che rimane)
                numChildren = Math.min(maxChildren, remaining.length);
            } else {
                // TREE_GEN.type.RANDOM: numero casuale tra min e max
                const effectiveMin = minChildren !== undefined ? minChildren : 0;
                const max = Math.min(maxChildren, remaining.length);
                const min = Math.min(effectiveMin, max);
                numChildren = randomIntegerExcluded(max - min + 1) + min;
            }

            // Aggiungi i figli
            let childrenAdded = 0;
            for (let i = 0; i < numChildren && remaining.length > 0; i++) {
                // Seleziona un figlio casuale dai nodi rimanenti
                const childIndex = Math.floor(Math.random() * remaining.length);
                const childId = remaining.splice(childIndex, 1)[0];

                // Crea l'arco
                const bidir = edgeTypeToBoolean(edgeType);
                const weight = computeWeight(input);
                const generated = generateEdge(parent.id, childId, bidir, weight);
                edges.push(...generated);

                // Aggiungi il figlio alla coda per futuri figli
                queue.push({ id: childId, childrenCount: 0 });
                childrenAdded++;
            }

            // Rimuovi il padre dalla coda se ha raggiunto il numero massimo di figli
            parent.childrenCount += childrenAdded;
            if (parent.childrenCount >= maxChildren || remaining.length === 0) {
                queue.splice(parentIndex, 1);
            }
        }

        // @ts-ignore
        cy?.add(edges);
    });
}
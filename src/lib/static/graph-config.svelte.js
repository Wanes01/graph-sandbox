import { GraphHistoryManager } from "$lib/static/graph-history.svelte";
import dagre from "cytoscape-dagre";
import cytoscape from "cytoscape";

// dagre layout for cytoscape js
cytoscape.use(dagre);

/**
 * Mimics an enum for the quick edit mode types.
 */
export const EDIT_MODES = Object.freeze({
  ADD_VERTEX: Symbol("ADD_VERTEX"),
  ADD_EDGE: Symbol("ADD_EDGE"),
  ADD_DOUBLE_EDGE: Symbol("ADD_DOUBLE_EDGE"),
  ERASER: Symbol("ERASER")
});

/**
 * The types of edges as an enum.
 */
export const EDGE_TYPES = Object.freeze({
  UNDIRECTED: Symbol('UNDIRECTED'),
  DIRECTED: Symbol('DIRECTED'),
  MIXED: Symbol('MIXED')
});

/**
 * General graph settings
 */
export const SETTINGS = $state({
  editMode: null,
  /**
   * @type {import("cytoscape").NodeSingular | null}
   */
  selectedNode: null,
  /** @type {Record<string, any>} */
  ui: {
    'layout': 'circle',
    'arrow-shape': 'triangle',
    'vertex-color': '#007bff',
    'edge-color': '#ccc',
    'show-labels': true,
    'show-weights': false,
    'curve-style': 'bezier',
    'disable-animation': false,
    'hide-edges-on-viewport': false,
    'texture-on-viewport': false,
    'motion-blur': false
  },
  maxNodes: 1000,
});

/**
 * Graph available layouts options
 */
export const LAYOUTS = [
  {
    name: "preset",
    padding: 30
  },
  {
    name: "circle",
    padding: 50
  },
  {
    name: "grid",
    padding: 30
  },
  {
    name: "concentric",
    padding: 100,
    minNodeSpacing: 120,
    // @ts-ignore
    concentric: node => node.degree(),
    levelWidth: () => 1
  },
  {
    name: "breadthfirst",
    fit: true, // Adatta il grafo alla viewport
    directed: true,
    padding: 50,
    circle: false, // Non disporre i nodi in cerchio
    grid: false, // IMPORTANTE: disattiva la griglia
    spacingFactor: 1.5, // Aumenta lo spazio tra i nodi
    boundingBox: undefined, // Usa tutto lo spazio disponibile
    avoidOverlap: true, // Evita sovrapposizioni
    nodeDimensionsIncludeLabels: true, // Considera le label nel calcolo delle dimensioni
    roots: undefined, // Opzionale: specifica i nodi radice, es. '#root1, #root2'
    maximal: false, // Se true, tutti i nodi senza predecessori diventano radici
    animationDuration: 500,
    animationEasing: undefined,
    ready: undefined,
    stop: undefined
  },
  {
    name: "cose",
    padding: 40,
    randomize: true,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    idealEdgeLength: 100,
    edgeElasticity: 100
  },
  {
    name: "random",
    padding: 50
  },
  {
    name: "dagre",
    padding: 60,
    rankDir: 'TB', // top to bottom
    nodeSep: 50,
    edgeSep: 10,
    rankSep: 80
  }
];

/* All layouts must scale the graph to fit the content */
// @ts-ignore
LAYOUTS.forEach(layout => {
  layout['fit'] = true;
  // @ts-ignore
  layout['animate'] = !SETTINGS['disable-animation'];
});

/**
 * Available styles for edges curves
 */
export const CURVE_STYLES = [
  'bezier',
  'haystack',
  'straight',
  'unbundled-bezier',
  'segments',
  'taxi',
  'straight-triangle',
  'round-segments',
  'round-taxi'
];

/**
 * Available arrow shapes
 */
export const ARROW_SHAPES = [
  "none",
  "triangle",
  "triangle-backcurve",
  "vee",
  "tee",
  "square",
  "circle",
  "diamond",
  "chevron"
];

/**
 * Weidght associated with edges which
 * the user put to infinity
 */
export const INF = Number.MAX_SAFE_INTEGER;

/**
 * An instance of the graph. See
 * Cytoscape.js for reference
 * 
 * @type {import("cytoscape").Core | null}
 */
export let cy = null;

/**
 * An instance of the graph history
 * manager
 * 
 * @type {GraphHistoryManager | null}
 */
export let historyManager = null;
const MAX_HISTORY = 50;

/**
 * The DOM Element representing
 * the graph.
 * @type {HTMLElement | null}
 */
export let cyDOM = null;

/**
 * @param {HTMLElement} domElement
 */
export function initializeGraph(domElement) {
  // @ts-ignore
  INIT_GRAPH_DATA['container'] = domElement;
  // @ts-ignore
  cy = cytoscape(INIT_GRAPH_DATA);
  cyDOM = domElement;
  historyManager = new GraphHistoryManager(cy, MAX_HISTORY);
  historyManager.save();
}

const INIT_GRAPH_DATA = {
  elements: [
    { data: { id: 'a', label: 'Nodo A', status: 'normal' } },
    { data: { id: 'b', label: 'Nodo B', status: 'normal' } },
    { data: { id: 'c', label: 'Nodo C', status: 'normal' } },
    { data: { id: 'ab', source: 'a', target: 'b', weight: 0, symbolicWeight: '0' } },
    { data: { id: 'bc', source: 'b', target: 'c', weight: 0, symbolicWeight: '0' } },
    { data: { id: 'ca', source: 'c', target: 'a', weight: 0, symbolicWeight: '0' } }
  ],

  layout: { name: SETTINGS.ui.layout },

  renderer: { name: 'canvas' },

  // Disabilita texture durante le interazioni
  textureOnViewport: false,
  
  // Abilita rendering con meno dettagli durante pan/zoom
  motionBlur: true,
  
  // Nascondi elementi durante le interazioni
  hideEdgesOnViewport: true,
  
  maxZoom: 3,

  style: [
    {
      selector: 'node',
      style: {
        backgroundColor: SETTINGS.ui['vertex-color']
      }
    },
    // nodes that have a label to show
    {
      selector: 'node[label]',
      style: {
        'background-color': SETTINGS.ui['vertex-color'],
        label: 'data(label)',
        color: 'white',
        'text-valign': 'center',
        'text-outline-color': SETTINGS.ui['vertex-color'],
        'text-outline-width': 2,
        'text-opacity': 1
      }
    },
    // node clicked to create an edge
    {
      selector: 'node[status = "begin-link"]',
      style: {
        'background-color': '#eb7d34',
        'text-outline-color': '#eb7d34'
      }
    },

    {
      selector: 'edge',
      style: {
        width: 2,
        'line-color': SETTINGS.ui['edge-color'],
        'target-arrow-color': SETTINGS.ui['edge-color'],
        'target-arrow-shape': SETTINGS.ui['arrow-shape'],
        'arrow-scale': 1.8,
        'curve-style': SETTINGS.ui['curve-style'],
        'font-size': 16
      }
    },
    // edges with infinity weights
    {
      selector: 'edge[symbolicWeight = "∞"], edge[symbolicWeight = "-∞"]',
      style: {
        'font-size': 30
      }
    },
    // unidirectional edges
    {
      selector: 'edge[type="unidir"]',
      style: {}
    },
    /* bidirectional edges. When a bidirectional edge is created,
        two edges are created: a bidir and a hidden one.
        Only the bidir arc is shown. The two arcs must be referenced
        to each other via a field in edge.data(...).
        This is done because only unidirectional arcs can be represented
        in cytoscape.js 
    */
    {
      selector: 'edge[type="bidir"]',
      style: {
        'source-arrow-shape': SETTINGS.ui['arrow-shape'],
        'source-arrow-color': SETTINGS.ui['edge-color']
      }
    },
    {
      selector: 'edge[type="hidden"]',
      style: {
        display: 'none'
      }
    }
  ],
};
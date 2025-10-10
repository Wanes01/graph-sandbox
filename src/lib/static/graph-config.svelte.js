import { GraphHistoryManager } from "$lib/static/graph-history.svelte";

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
    'vertex-color': '#007bff',
    'edge-color': '#ccc',
    'show-labels': true,
    'show-weights': false
  }
});

/**
 * Graph available layouts
 */
export const LAYOUTS = [
  "preset",
  "circle",
  "grid",
  "concentric",
  "breadthfirst",
  "cose",
  "random"
];

export const GRAPH_DATA = $state({
  nodes: 0,
  edges: 0
});

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
 * @param {import("cytoscape").Core} cyGraph
 * @param {HTMLElement} domElement
 */
export function initializeGraph(cyGraph, domElement) {
  cy = cyGraph;
  cyDOM = domElement;
  historyManager = new GraphHistoryManager(cy, MAX_HISTORY);
  historyManager.save();
}
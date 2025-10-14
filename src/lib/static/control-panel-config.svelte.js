import { EDIT_MODES, LAYOUTS, SETTINGS, ARROW_SHAPES, CURVE_STYLES, EDGE_TYPES } from "./graph-config.svelte";

export const quickEditData = [
    {
        id: 'add-vertex',
        alt: 'Add vertex',
        icon: 'add-vertex.svg',
        editMode: EDIT_MODES.ADD_VERTEX
    },
    {
        id: 'add-edge',
        alt: 'Add edge',
        icon: 'add-edge.svg',
        editMode: EDIT_MODES.ADD_EDGE
    },
    {
        id: 'add-double-edge',
        alt: 'Add double edge',
        icon: 'add-double-edge.svg',
        editMode: EDIT_MODES.ADD_DOUBLE_EDGE
    },
    {
        id: 'eraser',
        alt: 'Delete vertex/edge',
        icon: 'eraser.svg',
        editMode: EDIT_MODES.ERASER
    }
];

export const appearanceData = [
    {
        id: "show-labels",
        type: "checkbox",
        label: "Show labels"
    },
    {
        id: "show-weights",
        type: "checkbox",
        label: "Show weights"
    },
    {
        id: "layout",
        type: "select",
        label: "Layout",
        options: LAYOUTS.map(layout => layout.name)
    },
    {
        id: "arrow-shape",
        type: "select",
        label: "Arrow shape",
        options: ARROW_SHAPES
    },
    {
        id: "curve-style",
        type: "select",
        label: "Curve style",
        options: CURVE_STYLES
    },
    {
        id: "vertex-color",
        type: "color",
        label: "Vertex color",
        default: SETTINGS.ui["vertex-color"]
    },
    {
        id: "edge-color",
        type: "color",
        label: "Edge color",
        default: SETTINGS.ui["edge-color"]
    },
];

export const edgeGenerationData = [
    {
        label: "Undirected",
        type: EDGE_TYPES.UNDIRECTED
    },
    {
        label: "Directed",
        type: EDGE_TYPES.DIRECTED
    },
    {
        label: "Mixed",
        type: EDGE_TYPES.MIXED
    }
];

export const performanceData = [
    {
        id: "disable-animation",
        type: "checkbox",
        label: "Disable graph animations",
    },
    {
        id: "hide-edges-on-viewport",
        type: "checkbox",
        label: "Hide edges when interacting with the graph",
    },
    {
        id: "texture-on-viewport",
        type: "checkbox",
        label: "Use a texture during panning and zooming",
    },
    {
        id: "motion-blur",
        type: "checkbox",
        label: "Use a motion blur effect between frames",
    },
    {
        id: "webgl",
        type: "checkbox",
        label: "Render with WebGL"
    },
]
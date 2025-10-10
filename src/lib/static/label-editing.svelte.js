import { INF, cyDOM } from '$lib/static/graph-config.svelte';

/**
 * Updates the label of a node / an edge's weight based on
 * user input.
 * @param {import('cytoscape').NodeSingular | import('cytoscape').EdgeSingular} element 
 * @param {boolean} isNode 
 */
export function editElementLabel(element, isNode) {
    const input = document.createElement('input');
    input.type = "text";
    input.value = isNode
        ? element.data('label') || ''
        : element.data('symbolicWeight');

    input.className = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 w-[300px] text-center bg-blue-100";
    input.style.zIndex = (1000).toString();

    cyDOM?.appendChild(input);
    input.focus();

    function finish() {
        const newValue = isNode
            ? input.value.trim()
            : textToEdgeWeight(input.value);
        element.data(isNode ? 'label' : 'weight', newValue);

        /*
        Edges with INF/-INF weights must show a
        symbolic representation instead of
        a large number
         */
        if (!isNode) {
            const weight = Number(newValue);
            element.data(
                'symbolicWeight',
                weight >= INF || weight <= -INF
                    ? weight >= INF ? '∞' : '-∞'
                    : newValue
            )
        }
        cyDOM?.removeChild(input);
    }

    /**
       * @param {string} inp
       */
    function textToEdgeWeight(inp) {
        if (typeof inp !== "string") {
            return 0;
        }
        const s = inp.trim().toLowerCase();

        if (s === "inf" || s === "+inf" || s === "∞") {
            return INF;
        }
        if (s === "-inf" || s === "-∞") {
            return -INF;
        }

        // checks if the string is a valid number (integer or floating)
        if (/^[+-]?\d+(\.\d+)?$/.test(s)) {
            return Number(s);
        }

        return 0;
    }

    input.addEventListener('blur', finish);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') finish();
    });
}

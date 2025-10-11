<script>
    import { slide } from 'svelte/transition';

    const { children, legend, direction } = $props();
    let open = $state(true);

    function toggleBox() {
        open = !open;
    }
</script>

<fieldset
    class="relative flex flex-col gap-2 rounded-lg border-1 border-slate-300 bg-white px-3 py-3 pt-6 transition-all duration-200"
>
    <legend class="px-2 text-sm font-semibold text-slate-700">{legend}</legend>

    <!-- Bottone allineato al bordo superiore -->
    <button
        onclick={toggleBox}
        aria-label="Open / close {legend}"
        class="absolute top-0 right-3 flex h-6 w-8 -translate-y-11/24 items-center justify-center rounded-lg rounded-t-none border-1 border-t-0 border-slate-300 bg-white transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
    >
        <svg
            class="h-4 w-4 text-slate-600 transition-transform duration-200 {open
                ? 'rotate-180'
                : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
            />
        </svg>
    </button>

    {#if open}
        <ul
            class="flex flex-{direction} w-full list-none justify-between gap-2"
            transition:slide={{ duration: 200 }}
        >
            {@render children()}
        </ul>
    {/if}
</fieldset>

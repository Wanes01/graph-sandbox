<script>
    import { slide } from 'svelte/transition';

    const { children, legend, direction } = $props();

    let open = $state(true);

    function toggleBox() {
        open = !open;
    }
</script>

<div class="relative inline-block">
    <button
        onclick={toggleBox}
        aria-label="Open / close {legend}"
        class="absolute top-0 right-0 -translate-x-1/5 -translate-y-1/5 cursor-pointer rounded-md border-1 border-slate-400 bg-white px-2 py-1 transition-all duration-200 hover:border-blue-400 hover:bg-slate-50"
    >
        <svg
            class="h-4 w-4 transition-transform duration-200 {open
                ? 'rotate-180'
                : ''} text-slate-500"
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

    <fieldset
        class="flex flex-col gap-2 rounded-md border-t-1 border-slate-400 bg-white px-3 py-3 transition-all duration-200"
    >
        <legend class="px-2 text-sm font-semibold text-slate-700">{legend}</legend>

        {#if open}
            <ul
                class="flex flex-{direction} w-full list-none justify-between gap-2"
                transition:slide={{ duration: 200 }}
            >
                {@render children()}
            </ul>
        {/if}
    </fieldset>
</div>

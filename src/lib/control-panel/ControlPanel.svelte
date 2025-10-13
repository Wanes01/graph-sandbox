<script>
    import QuickEdit from './toolbox/QuickEdit.svelte';
    import Appearance from './toolbox/Appearance.svelte';
    import Generate from './toolbox/Generate.svelte';
    import Performance from './toolbox/Performance.svelte';

    let { open, width, onToggle } = $props();

    function toggleBox() {
        onToggle?.();
    }
</script>

<aside
    class="relative mr-2 h-[98vh] rounded-lg border-1 border-slate-300 bg-white shadow-lg transition-all duration-300"
    style="width: {width}"
>
    <div class="h-full overflow-y-scroll">
        <!-- Always visible tag to open / close the drawer -->
        <button
            onclick={toggleBox}
            aria-label="Open / close settings drawer"
            class="absolute top-1/2 left-0 flex h-24 w-7 -translate-x-full -translate-y-1/2 items-center justify-center rounded-l-lg border-1 border-r-0 border-slate-300 bg-white transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
        >
            <svg
                class="h-5 w-5 text-slate-600 transition-transform duration-200"
                class:rotate-180={open}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>

        <div class="px-4 py-2">
            <div
                class="flex flex-col gap-3 transition-opacity duration-300"
                style="opacity: {open ? '1' : '0'}; pointer-events: {open ? 'auto' : 'none'}"
            >
                <QuickEdit />
                <Appearance />
                <Performance />
                <Generate />
            </div>
        </div>
    </div>
</aside>

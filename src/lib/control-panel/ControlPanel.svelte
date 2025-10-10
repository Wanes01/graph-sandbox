<script>
    import QuickEdit from './toolbox/QuickEdit.svelte';
    import Appearance from './toolbox/Appearance.svelte';

    let { open, width, onToggle } = $props();

    function toggleBox() {
        onToggle?.();
    }
</script>

<aside
    class="relative mr-2 h-[98vh] rounded border-1 border-r-0 border-slate-400 bg-white px-4 py-2 shadow transition-all duration-300"
    style="width: {width}"
>
    <button
        onclick={toggleBox}
        class="absolute bottom-0 left-0 {!open
            ? ''
            : '-translate-x-1/2'} cursor-pointer rounded-md rounded-r-none {open
            ? 'border'
            : ''} border-r-0 border-slate-400 bg-white"
    >
        <img
            src="/icons/{open ? 'arrow-left' : 'arrow-right'}.svg"
            alt="Open / close control panel"
            class="h-10 w-8"
        />
    </button>
    <div
        class="flex flex-col gap-3 transition-opacity duration-300"
        style="opacity: {open ? '1' : '0'}; pointer-events: {open ? 'auto' : 'none'}"
    >
        {#if open}
            <QuickEdit />
            <Appearance />
        {/if}
    </div>
</aside>

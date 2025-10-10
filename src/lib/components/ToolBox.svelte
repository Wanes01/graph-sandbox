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
        class="absolute top-0 right-0 -translate-x-1/5 -translate-y-1/12 cursor-pointer rounded-md rounded-b-none border-1 border-b-0 border-slate-500 bg-white"
    >
        <img
            src="/icons/{open ? 'arrow-down' : 'arrow-up'}.svg"
            alt="Open / Close"
            class="h-6 w-10"
        />
    </button>
    <fieldset class="flex flex-col gap-2 rounded-md border-t border-slate-500 px-2 pt-3 pb-2">
        <legend class="px-2 font-semibold">{legend}</legend>
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

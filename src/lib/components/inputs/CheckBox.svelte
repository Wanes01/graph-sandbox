<script>
    import { blur } from 'svelte/transition';
    let { checked = $bindable(), label, disabled = false } = $props();
    function toggle() {
        if (!disabled) {
            checked = !checked;
        }
    }
</script>

<button
    onclick={toggle}
    class="flex w-full flex-row overflow-hidden rounded-lg border-1 transition-all duration-200
    {disabled
        ? 'cursor-not-allowed border-slate-300 bg-slate-50 opacity-60'
        : checked
          ? 'cursor-pointer border-blue-500 bg-blue-50 shadow-sm hover:border-blue-600 hover:bg-blue-100'
          : 'cursor-pointer border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}"
    {disabled}
>
    <div
        class="flex h-10 w-10 items-center justify-center transition-all duration-200
      {disabled ? 'bg-slate-200' : checked ? 'bg-blue-500' : 'bg-slate-100'}"
    >
        {#if checked}
            <img
                src="/icons/check.svg"
                alt="check"
                class="h-6 w-6 {disabled ? 'opacity-50' : ''}"
                transition:blur={{ duration: 150 }}
            />
        {/if}
    </div>
    <div class="flex flex-1 flex-row items-center px-3">
        <p class="text-sm font-medium {disabled ? 'text-slate-400' : 'text-slate-700'}">{label}</p>
    </div>
</button>

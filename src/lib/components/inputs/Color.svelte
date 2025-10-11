<script>
    // @ts-nocheck

    import { blur } from 'svelte/transition';

    let {
        value = $bindable(),
        label,
        placeholder = 'Select color...',
        disabled = false
    } = $props();

    let isPickerOpen = $state(false);
    /**
     * @type {HTMLInputElement}
     */
    let inputRef;

    function togglePicker() {
        if (!disabled) {
            isPickerOpen = !isPickerOpen;
            if (isPickerOpen) {
                // Focus the hidden color input to open native picker
                setTimeout(() => inputRef?.click(), 0);
            }
        }
    }

    /**
     * @param {{ target: { value: string; }; }} event
     */
    function handleColorChange(event) {
        if (!disabled) {
            value = event.target.value;
        }
    }

    /**
     * @param {{ target: { closest: (arg0: string) => any; }; }} event
     */
    function handleClickOutside(event) {
        if (!event.target.closest('.color-container')) {
            isPickerOpen = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="color-container relative w-full">
    {#if label}
        <p class="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
        </p>
    {/if}

    <button
        type="button"
        onclick={togglePicker}
        class="flex w-full flex-row items-stretch overflow-hidden rounded-lg border-1 transition-all duration-200
      {disabled
            ? 'cursor-not-allowed border-slate-300 bg-slate-50 opacity-60'
            : isPickerOpen
              ? 'cursor-pointer border-blue-500 bg-blue-50 shadow-sm'
              : 'cursor-pointer border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}"
        {disabled}
    >
        <div
            class="flex h-8 w-14 items-center justify-center transition-all duration-200"
            style="background-color: {value};"
        ></div>

        <div class="flex flex-1 flex-row items-center justify-between px-3">
            <p
                class="text-left text-sm font-medium {disabled
                    ? 'text-slate-400'
                    : value
                      ? 'text-slate-700'
                      : 'text-slate-400'}"
            >
                {value || placeholder}
            </p>

            <svg
                class="ml-2 h-4 w-4 flex-shrink-0 {disabled ? 'text-slate-400' : 'text-slate-500'}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
            </svg>
        </div>
    </button>

    <!-- Hidden native color input -->
    <input
        bind:this={inputRef}
        type="color"
        bind:value
        onchange={handleColorChange}
        class="pointer-events-none absolute opacity-0"
        {disabled}
    />
</div>

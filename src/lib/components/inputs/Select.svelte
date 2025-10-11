<script>
    import { slide } from 'svelte/transition';

    let {
        value = $bindable(),
        options = [],
        label,
        placeholder = 'Select...',
        disabled = false
    } = $props();

    let isOpen = $state(false);

    function toggleDropdown() {
        if (!disabled) {
            isOpen = !isOpen;
        }
    }

    // @ts-ignore
    function selectOption(optionValue) {
        if (!disabled) {
            value = optionValue;
            isOpen = false;
        }
    }

    function getSelectedLabel() {
        const selected = options.find((opt) => opt.value === value);
        return selected ? selected.label : placeholder;
    }

    // Closes the dropdown when user clicks outside of it
    // @ts-ignore
    function handleClickOutside(event) {
        if (!event.target.closest('.select-container')) {
            isOpen = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="select-container relative w-full">
    {#if label}
        <p class="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
        </p>
    {/if}

    <button
        type="button"
        onclick={toggleDropdown}
        class="flex w-full flex-row items-center justify-between rounded-lg border-1 px-3 py-2 transition-all duration-200
      {disabled
            ? 'cursor-not-allowed border-slate-300 bg-slate-50 opacity-60'
            : isOpen
              ? 'cursor-pointer border-blue-500 bg-blue-50 shadow-sm'
              : 'cursor-pointer border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}"
        {disabled}
    >
        <div class="flex flex-1 flex-row items-center">
            <p
                class="text-left text-sm font-medium {disabled
                    ? 'text-slate-400'
                    : value
                      ? 'text-slate-700'
                      : 'text-slate-400'}"
            >
                {getSelectedLabel()}
            </p>
        </div>

        <svg
            class="ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-200 {isOpen
                ? 'rotate-180'
                : ''} {disabled ? 'text-slate-400' : 'text-slate-500'}"
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

    {#if isOpen && !disabled}
        <div
            class="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border-1 border-slate-300 bg-white shadow-lg"
            transition:slide={{ duration: 200 }}
        >
            <div class="py-1">
                {#each options as option}
                    <button
                        type="button"
                        onclick={() => selectOption(option.value)}
                        class="flex w-full flex-row items-center px-3 py-2 text-left text-sm transition-colors duration-150
              {value === option.value
                            ? 'bg-blue-50 font-medium text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50'}"
                    >
                        <span class="mr-2 w-4">{option.label}</span>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>

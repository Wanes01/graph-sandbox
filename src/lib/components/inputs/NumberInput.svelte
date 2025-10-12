<script>
    let {
        value = $bindable(),
        label,
        placeholder = '0',
        disabled = false,
        min,
        max,
        step = 1
    } = $props();

    let isFocused = $state(false);

    /**
     * @param {number} num
     */
    function getDecimalPlaces(num) {
        const str = num.toString();
        if (str.includes('.')) {
            return str.split('.')[1].length;
        }
        return 0;
    }

    /**
     * Utility method to fix floating point
     * rapresentation issues.
     *
     * @param {number} num
     */
    function roundToStep(num) {
        const decimals = getDecimalPlaces(step);
        return parseFloat(num.toFixed(decimals));
    }

    /**
     * @param {any} event
     */
    function handleInput(event) {
        if (disabled) return;

        const newValue = event.target.value;

        if (newValue === '' || newValue === '-') {
            value = newValue;
            return;
        }

        const numValue = parseFloat(newValue);
        const isIntegerStep = Number.isInteger(step);

        if (!isNaN(numValue)) {
            let finalValue = numValue;

            // Se step è intero, arrotonda il valore
            if (isIntegerStep) {
                finalValue = Math.round(numValue);
            } else {
                finalValue = roundToStep(numValue);
            }

            if (min !== undefined && finalValue < min) {
                value = min;
            } else if (max !== undefined && finalValue > max) {
                value = max;
            } else {
                value = finalValue;
            }
        }
    }

    function handleBlur() {
        isFocused = false;
        if (value === '' || value === '-') {
            value = min !== undefined ? min : 0;
        }
    }

    function increment() {
        if (disabled) return;
        const currentValue = parseFloat(value) || 0;
        const newValue = roundToStep(currentValue + step);
        if (max === undefined || newValue <= max) {
            value = newValue;
        }
    }

    function decrement() {
        if (disabled) return;
        const currentValue = parseFloat(value) || 0;
        const newValue = roundToStep(currentValue - step);
        if (min === undefined || newValue >= min) {
            value = newValue;
        }
    }
</script>

<div class="number-input-container w-full">
    {#if label}
        <p class="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
        </p>
    {/if}

    <div
        class="flex w-full flex-row items-stretch overflow-hidden rounded-lg border-1 transition-all duration-200
      {disabled
            ? 'cursor-not-allowed border-slate-300 bg-slate-50 opacity-60'
            : isFocused
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}"
    >
        <button
            aria-label="Increment {label} by {step}"
            type="button"
            onclick={decrement}
            class="flex w-9 items-center justify-center transition-all duration-200
        {disabled
                ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                : 'cursor-pointer bg-slate-100 text-slate-600 hover:bg-blue-200'}"
            {disabled}
        >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                />
            </svg>
        </button>

        <input
            type="number"
            bind:value
            oninput={handleInput}
            onfocus={() => (isFocused = true)}
            onblur={handleBlur}
            {placeholder}
            {disabled}
            {min}
            {max}
            {step}
            class="flex-1 border-none bg-transparent px-3 py-2 text-center text-sm font-medium outline-none
        {disabled ? 'cursor-not-allowed text-slate-400' : 'text-slate-700'}
        [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            onkeypress={(e) => {
                if (Number.isInteger(step) && (e.key === '.' || e.key === ',')) {
                    e.preventDefault();
                }
            }}
        />

        <button
            aria-label="Decrement {label} by {step}"
            type="button"
            onclick={increment}
            class="flex w-9 items-center justify-center transition-all duration-200
        {disabled
                ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                : 'cursor-pointer bg-slate-100 text-slate-600 hover:bg-blue-200'}"
            {disabled}
        >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                />
            </svg>
        </button>
    </div>
</div>

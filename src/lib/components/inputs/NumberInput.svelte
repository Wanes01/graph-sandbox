<script>
    let {
        value = $bindable(),
        label,
        min,
        max,
        step = 1,
        placeholder = null,
        blankAllowed = false,
        disabled = false,
        def = null,
        spinner = false
    } = $props();

    let isFocused = $state(false);
    let stringInput = $state('');

    /* default value on component mount */
    if (blankAllowed && def == null) {
        value = undefined;
    } else {
        value = def !== null ? def : min;
    }

    // initilizes stringInput if the value cannot be blank
    if (!blankAllowed) {
        defaultStringInput();
    }

    // sync stringInput when value changes
    $effect(() => {
        if (!isFocused && value !== undefined && value !== null) {
            stringInput = value.toString();
        } else if (!isFocused && (value === undefined || value === null) && blankAllowed) {
            stringInput = '';
        }
    });

    function oninput() {
        if (blankAllowed && stringInput === '') {
            value = undefined;
            return;
        }

        if (!blankAllowed && stringInput === '') {
            return;
        }

        /* INPUT TYPING CHECK */
        const isNegative = stringInput.startsWith('-');
        const minusOcc = occurrencesOf('-', stringInput);
        /* Defaults input if the "-" sign is placed incorrectly or multiple times */
        if ((isNegative && minusOcc > 1) || (!isNegative && minusOcc > 0)) {
            defaultStringInput();
            return;
        }

        // Permetti solo "-" durante la digitazione
        if (stringInput === '-') {
            return;
        }

        const decimalSep = ['.', ','];
        // is a decimal number
        if (decimalSep.some((s) => stringInput.includes(s))) {
            // Defaults input if the number contains both "." and "," as decimal separators
            if (decimalSep.every((s) => stringInput.includes(s))) {
                defaultStringInput();
                return;
            }

            // the separator used
            const sep = decimalSep[stringInput.includes('.') ? 0 : 1];
            const sepIndex = stringInput.indexOf(sep);
            // Defaults input if the separator is placed incorrectly or multiple times
            if (
                sepIndex === 0 ||
                (sepIndex > 0 && isNaN(Number(stringInput[sepIndex - 1]))) ||
                occurrencesOf(sep, stringInput) > 1
            ) {
                defaultStringInput();
                return;
            }

            /* converts the separator to comply Number() */
            if (sep === ',') {
                stringInput = stringInput.replace(',', '.');
            }
        }

        /* Number value check */
        const number = Number(stringInput);
        if (isNaN(number)) {
            defaultStringInput();
            return;
        }

        // updates the numerical value
        value = number;
    }

    function onfocusloss() {
        isFocused = false;

        // if the string contains only "-" reset to default
        if (stringInput === '-') {
            defaultStringInput();
            return;
        }

        if (!blankAllowed && stringInput === '') {
            defaultStringInput();
            return;
        }

        // ensures that the numerical value is syncronized and applies limits
        if (stringInput !== '') {
            const number = Number(stringInput);
            if (!isNaN(number)) {
                // applies the min / max limits if needed
                if (min !== undefined && number < min) {
                    value = min;
                    stringInput = min.toString();
                } else if (max !== undefined && number > max) {
                    value = max;
                    stringInput = max.toString();
                } else {
                    value = number;
                }
            } else if (!blankAllowed) {
                defaultStringInput();
            }
        }
    }

    /**
     * @param {string} char
     * @param {string} string
     */
    function occurrencesOf(char, string) {
        return string.split(char).length - 1;
    }

    function defaultStringInput() {
        const defaultValue = def !== null ? def : min;
        stringInput = defaultValue.toString();
        value = defaultValue;
    }

    /**
     * Allows to type only digits, some special characters and shortcuts
     * @param {KeyboardEvent} e
     */
    function onkeydown(e) {
        /* allow the following keys for navigation over the input */
        if (
            [
                'Backspace',
                'Delete',
                'Tab',
                'Escape',
                'Enter',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End'
            ].includes(e.key)
        ) {
            return;
        }
        // allowed shortcuts : Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'A', 'C', 'V', 'X'].includes(e.key)) {
            return;
        }

        // allow "-" only at the beginning of the string and if not already present
        if (e.key === '-') {
            const input = e.target;
            // @ts-ignore
            const cursorPosition = input?.selectionStart;
            if (cursorPosition === 0 && !stringInput.includes('-')) {
                return;
            }
            e.preventDefault();
            return;
        }

        // digits managment
        if (/^[0-9]$/.test(e.key)) {
            const input = e.target;
            // @ts-ignore
            const cursorPosition = input?.selectionStart;
            // @ts-ignore
            const hasSelection = input?.selectionStart !== input?.selectionEnd;

            // if there is a selection allow input
            if (hasSelection) {
                return;
            }

            const decimalSep = ['.', ','];
            const currentSep = decimalSep.find((s) => stringInput.includes(s));

            // if the number has decimal places
            if (currentSep) {
                const maxDecimals = getMaxDecimalPlaces();
                const sepIndex = stringInput.indexOf(currentSep);
                if (cursorPosition > sepIndex) {
                    const currentDecimals = stringInput.length - sepIndex - 1;

                    // blocks input if the decimal places are more then the allowed amount
                    if (currentDecimals >= maxDecimals) {
                        e.preventDefault();
                        return;
                    }
                }
            }
            return;
        }

        // allow decimal separator only if the step allows it
        if (/^[,.]$/.test(e.key)) {
            const maxDecimals = getMaxDecimalPlaces();
            if (maxDecimals === 0) {
                e.preventDefault();
                return;
            }
            return;
        }

        // block input if the character is not allowed
        e.preventDefault();
    }

    /**
     * computes the max number of decimal places allowed by the step
     */
    function getMaxDecimalPlaces() {
        const stepStr = step.toString();
        if (!stepStr.includes('.')) return 0;
        return stepStr.split('.')[1].length;
    }

    /**
     * @param {(arg0: any) => any} comparator
     * @param {() => any} newValueCalculator
     */
    function applyStep(comparator, newValueCalculator) {
        if (value !== undefined) {
            const maxDecimals = getMaxDecimalPlaces();
            const newValue = newValueCalculator();
            const res = maxDecimals > 0 ? Number(newValue.toFixed(maxDecimals)) : newValue;
            if (comparator(res)) {
                value = res;
            }
        }
    }

    function increment() {
        applyStep(
            (res) => res <= max,
            () => value + step
        );
    }

    function decrement() {
        applyStep(
            (res) => res >= min,
            () => value - step
        );
    }

    /**
     * @type {string | number | NodeJS.Timeout | null | undefined}
     */
    let intervalId = null;
    const buttonsInterval = 180;

    /**
     * @param {() => void} fn
     */
    function setButtonInterval(fn) {
        fn();
        intervalId = setInterval(() => {
            fn();
        }, buttonsInterval);
    }

    function clearButtonInterval() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
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
        {#if spinner}
            <button
                onmousedown={() => setButtonInterval(decrement)}
                onmouseup={clearButtonInterval}
                onmouseleave={clearButtonInterval}
                aria-label="Decrement {label} by {step}"
                type="button"
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
        {/if}
        <input
            bind:value={stringInput}
            type="text"
            {oninput}
            {onkeydown}
            onfocus={() => (isFocused = true)}
            onblur={onfocusloss}
            {placeholder}
            {disabled}
            class="w-0 flex-1 border-none bg-transparent px-3 py-2 text-center text-sm font-medium outline-none
            {disabled ? 'cursor-not-allowed text-slate-400' : 'text-slate-700'}
            [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {#if spinner}
            <button
                onmousedown={() => setButtonInterval(increment)}
                onmouseup={clearButtonInterval}
                onmouseleave={clearButtonInterval}
                aria-label="Increment {label} by {step}"
                type="button"
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
        {/if}
    </div>
</div>

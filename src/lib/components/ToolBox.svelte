<script>
    const { children, legend, direction } = $props();
</script>

<fieldset class="flex flex-col gap-2 border border-black p-2">
    <legend class="text-sm font-semibold">{legend}</legend>
    <ul class="flex flex-{direction} w-full list-none justify-between gap-2">
        {@render children()}
    </ul>
</fieldset>

<script>
    import { SETTINGS } from '$lib/static/graph-config.svelte';

    const { id, alt, icon, editMode } = $props();
    // dato derivato => cambia sempre quando cambia SETTINGS.editMode
    let pressed = $derived(SETTINGS.editMode === editMode);

    const baseStyle = 'w-full flex flex-row justify-center py-2 px-4 rounded cursor-pointer ';
    const disabledStyle =
        'bg-blue-200 hover:bg-blue-300 border-b-3 border-blue-500 hover:border-blue-500';
    const enabledStyle = 'inset-shadow-sm inset-shadow-blue-600 bg-blue-100';

    function onclick() {
        if (SETTINGS.editMode === editMode) {
            SETTINGS.editMode = null;
            return;
        }
        if (SETTINGS.selectedNode) {
            // @ts-ignore
            SETTINGS.selectedNode.data('status', 'normal');
            SETTINGS.selectedNode = null;
        }
        SETTINGS.editMode = editMode;
    }
</script>

<button {onclick} {id} class={baseStyle + (pressed ? enabledStyle : disabledStyle)}>
    <img src="/icons/{icon}" {alt} class="h-8" />
</button>

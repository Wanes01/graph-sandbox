<script>
    import Graph from '$lib/graph/Graph.svelte';
    import ControlPanel from '$lib/control-panel/ControlPanel.svelte';

    let ctrlPanelOpen = $state(true);
    let ctrlPanelWidth = $derived(ctrlPanelOpen ? 23 : 1);
    let graphWidth = $derived(100 - ctrlPanelWidth);
</script>

<main class="relative flex h-screen flex-row items-center justify-between bg-[#EEEEEE]">
    <Graph width={graphWidth.toString() + '%'} />
    <ControlPanel
        open={ctrlPanelOpen}
        width={ctrlPanelWidth.toString() + '%'}
        onToggle={() => (ctrlPanelOpen = !ctrlPanelOpen)}
    />
</main>

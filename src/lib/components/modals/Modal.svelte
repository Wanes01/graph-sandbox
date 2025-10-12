<script>
    let { children } = $props();
</script>

<div class="fixed inset-0 z-50 bg-black/20">
    <div
        class="fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-row rounded-lg border border-slate-300 bg-white p-4 shadow-lg"
    >
        {@render children()}
    </div>
</div>

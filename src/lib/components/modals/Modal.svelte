<script>
    let { children } = $props();
</script>

<div class="absolute top-0 left-0 h-screen w-screen bg-[rgb(1,1,1,0.2)]">
    <div
        class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-row rounded-lg border border-slate-300 bg-white p-4 shadow-lg"
    >
        {@render children()}
    </div>
</div>

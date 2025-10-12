<script>
    let { children, color, onclick } = $props();
</script>

<button
    {onclick}
    class="flex flex-1 cursor-pointer flex-row items-center justify-center rounded-md border-b-3 border-{color}-900 bg-{color}-200 p-2 font-bold text-{color}-900
           hover:bg-{color}-300
           active:border-b-0 active:pt-[10px] active:pb-[8px] active:inset-shadow-sm active:inset-shadow-{color}-800"
>
    {@render children()}
</button>

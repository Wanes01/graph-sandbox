<script>
    import { slide } from 'svelte/transition';
    let { children, dir = null, gap = null } = $props();
</script>

<div
    class="transition-all duration-200 {dir ? `flex flex-${dir}` : ''} {dir && gap
        ? `gap-${gap}`
        : ''}"
    transition:slide={{ duration: 200 }}
>
    {@render children()}
</div>

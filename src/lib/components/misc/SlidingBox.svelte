<script>
    import { slide } from 'svelte/transition';
    let { children } = $props();
</script>

<div class="transition-all duration-200" transition:slide={{ duration: 200 }}>
    {@render children()}
</div>

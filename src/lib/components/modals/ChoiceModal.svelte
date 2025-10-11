<script>
    import Modal from './Modal.svelte';
    import Button from '../inputs/Button.svelte';

    let { text, leftColor, leftOnClick, leftText, rightColor, rightOnClick, rightText } = $props();
</script>

<Modal>
    <div class="flex max-w-100 flex-col gap-4">
        <p>{text}</p>
        <div class="item flex flex-row gap-4">
            <Button color={leftColor} onclick={leftOnClick}>{leftText}</Button>
            <Button color={rightColor} onclick={rightOnClick}>{rightText}</Button>
        </div>
    </div>
</Modal>

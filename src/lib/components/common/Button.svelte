<script lang="ts">
    let {
        variant = 'primary',
        size = 'md',
        onclick,
        disabled = false,
        class: className = '',
        children,
        ...rest
    }: {
        variant?: 'primary' | 'secondary' | 'ghost';
        size?: 'sm' | 'md' | 'lg';
        onclick?: (e: MouseEvent) => void;
        disabled?: boolean;
        class?: string;
        children?: import('svelte').Snippet;
        [key: string]: any;
    } = $props();
</script>

<button
    class="btn btn-{variant} btn-{size} {className}"
    {onclick}
    {disabled}
    {...rest}
>
    {@render children?.()}
</button>

<style>
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-weight: 500;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        user-select: none;
        outline: none;
        font-family: inherit;
    }

    .btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    .btn-sm {
        height: 36px;
        padding: 0 14px;
        font-size: 0.8125rem;
        border-radius: 8px;
    }

    .btn-md {
        height: 42px;
        padding: 0 20px;
        font-size: 0.875rem;
    }

    .btn-lg {
        height: 48px;
        padding: 0 28px;
        font-size: 1rem;
        border-radius: 12px;
    }

    .btn-primary {
        background: #ffffff;
        color: #000000;
        border-color: transparent;
    }

    .btn-primary:not(:disabled):hover {
        background: #e5e5e5;
        transform: translateY(-1px);
    }

    .btn-primary:not(:disabled):active {
        transform: translateY(0);
        background: #d4d4d4;
    }

    .btn-secondary {
        background: rgba(255, 255, 255, 0.06);
        color: var(--color-text);
        border-color: rgba(255, 255, 255, 0.08);
    }

    .btn-secondary:not(:disabled):hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.12);
    }

    .btn-secondary:not(:disabled):active {
        background: rgba(255, 255, 255, 0.04);
    }

    .btn-ghost {
        background: transparent;
        color: var(--color-text-muted);
        border-color: transparent;
    }

    .btn-ghost:not(:disabled):hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--color-text);
    }

    .btn-ghost:not(:disabled):active {
        background: rgba(255, 255, 255, 0.03);
    }
</style>

<script lang="ts">
    import { uiStore } from '$lib/stores/ui.svelte';

    const icons = {
        success: {
            path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'var(--color-success)'
        },
        error: {
            path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
            color: 'var(--color-danger)'
        },
        info: {
            path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            color: '#60a5fa'
        }
    };

    function dismiss(id: string) {
        uiStore.removeToast(id);
    }
</script>

{#if uiStore.toasts.length > 0}
    <div class="toast-container">
        {#each uiStore.toasts as toast (toast.id)}
                        <div class="toast glass-raised toast-{toast.type}">
                <div class="toast-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={(icons[toast.type] ?? icons.info).color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d={(icons[toast.type] ?? icons.info).path}></path>
                    </svg>
                </div>
                <span class="toast-message">{toast.message}</span>
                <button class="toast-dismiss" onclick={() => dismiss(toast.id)} aria-label="关闭">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        {/each}
    </div>
{/if}

<style>
    .toast-container {
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        pointer-events: none;
    }

    .toast {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        min-width: 240px;
        max-width: 420px;
        width: auto;
        border-radius: 14px;
        background: #1c1c1e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .toast-success {
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(52, 199, 89, 0.06);
    }

    .toast-error {
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(255, 69, 58, 0.06);
    }

    .toast-info {
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(96, 165, 250, 0.06);
    }

    .toast-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .toast-message {
        flex: 1;
        font-size: 0.875rem;
        color: var(--color-text);
        line-height: 1.4;
    }

    .toast-dismiss {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--color-text-dim);
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s;
    }

    .toast-dismiss:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-text-muted);
    }

    @keyframes toast-in {
        from {
            opacity: 0;
            transform: translateX(16px) scale(0.96);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }
</style>

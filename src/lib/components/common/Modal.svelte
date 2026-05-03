<script lang="ts">
    let {
        open = $bindable(false),
        title = '',
        onclose,
        children
    }: {
        open?: boolean;
        title?: string;
        onclose: () => void;
        children: import('svelte').Snippet;
    } = $props();

    $effect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    });
</script>

{#if open}
    <div class="modal-backdrop" role="dialog" aria-modal="true">
        <button class="modal-overlay" onclick={onclose} aria-label="关闭"></button>
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">{title}</h2>
                <button class="modal-close" onclick={onclose} aria-label="关闭">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                {@render children()}
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }

    .modal-content {
        position: relative;
        width: 100%;
        max-width: 32rem;
        margin: 1rem;
        border-radius: 20px;
        background: #1c1c1e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0;
        animation: modal-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.04),
            0 24px 80px rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 768px) {
        .modal-backdrop {
            align-items: flex-end;
        }

        .modal-content {
            margin: 0;
            border-radius: 20px 20px 0 0;
            max-height: 85vh;
            max-width: 100%;
            animation: modal-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .modal-title {
        font-size: 1.0625rem;
        font-weight: 600;
        color: #ffffff;
        margin: 0;
    }

    .modal-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: #86868b;
        cursor: pointer;
        transition: all 0.2s;
    }

    .modal-close:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.06);
    }

    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
    }

    @keyframes modal-fade-in {
        from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    @keyframes modal-slide-up {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }
</style>

<script lang="ts">
    import { r2Client } from '$lib/r2/r2-client';
    import { authStore } from '$lib/stores/auth.svelte';
    import { uiStore } from '$lib/stores/ui.svelte';
    import { dbStore } from '$lib/stores/database.svelte';
    import type { R2File } from '$lib/r2/types';
    import Button from '$lib/components/common/Button.svelte';

    let open = $state(false);
    let files = $state<R2File[]>([]);
    let isLoading = $state(false);

    async function loadFiles() {
        isLoading = true;
        try {
            files = await r2Client.listFiles();
        } catch (e) {
            uiStore.addToast(e instanceof Error ? e.message : '加载文件列表失败', 'error');
        } finally {
            isLoading = false;
        }
    }

    function openPicker() {
        open = true;
        loadFiles();
    }

    async function selectFile(file: R2File) {
        isLoading = true;
        try {
            const { data, etag } = await r2Client.getFileContent(file.key);
            dbStore.fileName = file.key;
            dbStore.fileSource = true;
            dbStore.fileKey = file.key;
            dbStore.remoteEtag = etag;
            onselect(data, file.key, file.key);
            open = false;
        } catch (e) {
            uiStore.addToast(e instanceof Error ? e.message : '下载文件失败', 'error');
        } finally {
            isLoading = false;
        }
    }

    async function deleteFile(file: R2File) {
        if (!confirm(`确定要删除「${file.key}」吗？此操作不可撤销。`)) return;
        try {
            await r2Client.deleteFile(file.key);
            files = files.filter(f => f.key !== file.key);
            uiStore.addToast(`已删除 ${file.key}`, 'success');
        } catch (e) {
            uiStore.addToast(e instanceof Error ? e.message : '删除失败', 'error');
        }
    }

    function formatDate(iso: string): string {
        try {
            return new Date(iso).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return iso;
        }
    }

    let {
        onselect
    }: {
        onselect: (data: ArrayBuffer, fileKey: string, fileName: string) => void;
    } = $props();
</script>

{#if authStore.isAuthenticated}
    <Button variant="secondary" class="w-full" onclick={openPicker}>
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        打开云端文件
    </Button>
{/if}

{#if open}
    <div class="picker-backdrop" role="dialog" aria-modal="true">
        <button class="picker-overlay" onclick={() => (open = false)} aria-label="关闭"></button>
        <div class="picker-panel glass-raised">
            <div class="picker-header">
                <div class="picker-header-left">
                    <svg class="picker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <h2 class="picker-title">云端文件</h2>
                </div>
                <div class="picker-header-actions">
                    <button class="picker-refresh glass-hover" onclick={loadFiles} aria-label="刷新" title="刷新">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <button class="picker-close glass-hover" onclick={() => (open = false)} aria-label="关闭">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="picker-list">
                {#if isLoading}
                    <div class="picker-loading">
                        <div class="spinner"></div>
                    </div>
                {:else if files.length === 0}
                    <div class="picker-empty">
                        <svg class="picker-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        <p class="picker-empty-text">云端暂无 .kdbx 文件</p>
                        <p class="picker-empty-hint">请先在本地创建密码库，然后上传</p>
                    </div>
                {:else}
                    {#each files as file (file.key)}
                        <div class="file-item-wrapper">
                            <button
                                class="file-item glass-hover"
                                onclick={() => selectFile(file)}
                            >
                                <svg class="file-icon file-icon-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div class="file-info">
                                    <div class="file-label">{file.key}</div>
                                    <div class="file-meta">
                                        {#if file.size}
                                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                                        {/if}
                                        {#if file.lastModified}
                                            <span>{formatDate(file.lastModified)}</span>
                                        {/if}
                                    </div>
                                </div>
                                <span class="kdbx-badge">.kdbx</span>
                            </button>
                            <button
                                class="file-delete glass-hover"
                                onclick={(e) => { e.stopPropagation(); deleteFile(file); }}
                                aria-label="删除"
                                title="删除文件"
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .picker-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .picker-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }

    .picker-panel {
        position: relative;
        width: 100%;
        max-width: 42rem;
        margin: 1rem;
        border-radius: 20px;
        background: #1c1c1e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        animation: panel-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
    }

    @media (max-width: 768px) {
        .picker-backdrop {
            align-items: flex-end;
        }

        .picker-panel {
            margin: 0;
            border-radius: 20px 20px 0 0;
            max-height: 85vh;
            max-width: 100%;
            animation: picker-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
    }

    .picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .picker-header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .picker-header-actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .picker-icon {
        width: 24px;
        height: 24px;
        color: #60a5fa;
    }

    .picker-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
    }

    .picker-refresh,
    .picker-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: var(--color-text-muted);
        cursor: pointer;
        transition: all 0.2s;
    }

    .picker-refresh:hover,
    .picker-close:hover {
        color: var(--color-text);
    }

    .picker-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.75rem;
    }

    .picker-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 0;
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 2px solid var(--color-accent);
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
    }

    .picker-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 0;
        color: var(--color-text-dim);
    }

    .picker-empty-icon {
        width: 48px;
        height: 48px;
        opacity: 0.5;
        margin-bottom: 0.75rem;
    }

    .picker-empty-text {
        font-size: 0.875rem;
        margin: 0;
    }

    .picker-empty-hint {
        font-size: 0.75rem;
        margin: 0.5rem 0 0;
        opacity: 0.6;
    }

    .file-item-wrapper {
        display: flex;
        align-items: center;
        gap: 0;
        margin-bottom: 2px;
    }

    .file-item {
        flex: 1;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 12px;
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
    }

    .file-item:hover {
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    }

    .file-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .file-icon-accent {
        color: var(--color-accent);
    }

    .file-info {
        flex: 1;
        min-width: 0;
    }

    .file-label {
        font-size: 0.875rem;
        color: var(--color-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .file-meta {
        display: flex;
        gap: 0.75rem;
        font-size: 0.75rem;
        color: var(--color-text-dim);
        margin-top: 2px;
    }

    .kdbx-badge {
        font-size: 0.75rem;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 8px;
        border-radius: 6px;
        flex-shrink: 0;
    }

    .file-delete {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--color-text-dim);
        cursor: pointer;
        transition: all 0.15s;
        flex-shrink: 0;
        opacity: 0;
    }

    .file-item-wrapper:hover .file-delete {
        opacity: 1;
    }

    .file-delete:hover {
        color: var(--color-danger);
        background: rgba(255, 69, 58, 0.1);
    }

    @keyframes panel-in {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    @keyframes picker-slide-up {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>

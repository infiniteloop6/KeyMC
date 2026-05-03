<script lang="ts">
	import type { EntryDto } from '$lib/kdbx/kdbx-types';
	import { kdbxService } from '$lib/kdbx/kdbx-service';
	import { uiStore } from '$lib/stores/ui.svelte';

	let {
		entry,
		selected = false,
		onclick
	}: {
		entry: EntryDto;
		selected?: boolean;
		onclick: () => void;
	} = $props();

	function copyToClipboard(text: string, label: string) {
		navigator.clipboard.writeText(text);
		uiStore.addToast(`${label}已复制`, 'success');
		setTimeout(() => {
			navigator.clipboard.writeText('');
		}, 30000);
	}

	function copyPassword(e: MouseEvent) {
		e.stopPropagation();
		try {
			const pw = kdbxService.getEntryPassword(entry.id);
			copyToClipboard(pw, '密码');
		} catch {
			uiStore.addToast('复制密码失败', 'error');
		}
	}

	function getDomain(url: string): string {
		try {
			const parsed = new URL(url);
			if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
			return parsed.hostname;
		} catch {
			return '';
		}
	}

	function handleFaviconError(e: Event) {
		const img = e.target as HTMLImageElement;
		img.style.display = 'none';
		const fallback = img.nextElementSibling as HTMLElement;
		if (fallback) fallback.style.display = '';
	}
</script>

<div
	class="entry-card w-full text-left p-4 rounded-xl mb-2 transition-all duration-200 cursor-pointer
		{selected
			? 'bg-white/10 border border-white/10'
			: 'bg-[#111] border border-[rgba(255,255,255,0.04)] hover:bg-white/5 hover:border-[rgba(255,255,255,0.08)]'}"
	role="button"
	tabindex="0"
	onclick={onclick}
	onkeydown={(e) => e.key === 'Enter' && onclick()}
>
	<div class="flex items-center gap-3.5">
		<div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-[var(--color-text-dim)]">
			{#if entry.url}
				{@const domain = getDomain(entry.url)}
				{#if domain}
					<img
						src="https://www.google.com/s2/favicons?domain={domain}&sz=32"
						alt=""
						class="w-5 h-5 rounded"
						onerror={handleFaviconError}
					/>
					<svg class="w-5 h-5" style="display:none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
					</svg>
				{/if}
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
				</svg>
			{/if}
		</div>

		<div class="flex-1 min-w-0">
			<div class="text-[15px] font-medium text-white truncate">{entry.title || '无标题'}</div>
			<div class="text-sm text-[var(--color-text-dim)] truncate mt-0.5">{entry.userName || '无用户名'}</div>
		</div>

		<button
			class="p-2 rounded-lg text-[var(--color-text-dim)] transition-all duration-200 shrink-0 cursor-pointer
				hover:text-white hover:bg-white/5"
			onclick={copyPassword}
			title="复制密码"
		>
			<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
			</svg>
		</button>
	</div>
</div>

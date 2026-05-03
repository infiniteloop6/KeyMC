<script lang="ts">
	import type { EntryDto } from '$lib/kdbx/kdbx-types';
	import { kdbxService } from '$lib/kdbx/kdbx-service';
	import { dbStore } from '$lib/stores/database.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';

	let showPassword = $state(false);

	let entry: EntryDto | null = $derived(dbStore.selectedEntry);
	let password = $derived.by(() => {
		if (!entry) return '';
		try {
			return kdbxService.getEntryPassword(entry.id);
		} catch {
			return '';
		}
	});

	function copyToClipboard(text: string, label: string) {
		navigator.clipboard.writeText(text);
		uiStore.addToast(`${label}已复制`, 'success');
		setTimeout(() => {
			navigator.clipboard.writeText('');
		}, 30000);
	}

	function togglePassword() {
		showPassword = !showPassword;
	}

	function startEdit() {
		uiStore.editingEntry = true;
	}

	function handleDelete() {
		if (!entry) return;
		if (!confirm(`确定要删除「${entry.title || '无标题'}」吗？`)) return;
		try {
			dbStore.deleteEntry(entry.id);
			uiStore.addToast('条目已删除', 'success');
		} catch {
			uiStore.addToast('删除失败', 'error');
		}
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function maskPassword(pw: string): string {
		return '•'.repeat(Math.min(pw.length, 20));
	}
</script>
{#if entry}
	<div class="flex flex-col h-full overflow-y-auto p-3 md:p-5 gap-3 md:gap-4 animate-[var(--animate-slide-in-right)]">
		<div class="md:hidden flex items-center gap-3 mb-1">
			<button
				class="p-2 -ml-2 rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
				onclick={() => dbStore.selectedEntryId = null}
				aria-label="返回列表"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
				</svg>
			</button>
			<span class="text-sm text-[var(--color-text-muted)]">返回列表</span>
		</div>

		<div class="bg-[#111] rounded-2xl p-6 border border-[rgba(255,255,255,0.06)]">
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1 min-w-0">
					<h2 class="text-xl font-semibold text-white truncate">
						{entry.title || '无标题'}
					</h2>
					{#if entry.url}
						<a
							href={entry.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-[var(--color-text-muted)] hover:text-white transition-colors truncate block mt-1"
						>
							{entry.url}
						</a>
					{/if}
				</div>
				<div class="flex items-center gap-1.5 shrink-0">
					<button
						class="p-2.5 rounded-xl text-[var(--color-text-muted)] transition-all duration-200 cursor-pointer hover:text-white hover:bg-white/5"
						onclick={startEdit}
						title="编辑"
					>
						<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</button>
					<button
						class="p-2.5 rounded-xl text-[var(--color-text-muted)] transition-all duration-200 cursor-pointer hover:text-[var(--color-danger)] hover:bg-white/5"
						onclick={handleDelete}
						title="删除"
					>
						<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				</div>
			</div>

	
		</div>

		<div class="bg-[#111] rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]">
			<div class="flex items-center justify-between gap-3">
				<div class="min-w-0 flex-1">
					<span class="text-xs text-[var(--color-text-dim)] uppercase tracking-widest mb-1.5 block font-medium">用户名</span>
					<div class="text-[15px] text-white truncate">{entry.userName || '无用户名'}</div>
				</div>
				<button
					class="p-2.5 rounded-xl text-[var(--color-text-dim)] transition-all duration-200 shrink-0 cursor-pointer
						hover:text-white hover:bg-white/5"
					onclick={() => entry.userName && copyToClipboard(entry.userName, '用户名')}
					title="复制用户名"
					disabled={!entry.userName}
				>
					<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
					</svg>
				</button>
			</div>
		</div>

		<div class="bg-[#111] rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]">
			<div class="flex items-center justify-between gap-3">
				<div class="min-w-0 flex-1">
					<span class="text-xs text-[var(--color-text-dim)] uppercase tracking-widest mb-1.5 block font-medium">密码</span>
					<div class="text-[15px] text-white font-mono truncate">
						{showPassword ? password : maskPassword(password)}
					</div>
				</div>
				<div class="flex items-center gap-1 shrink-0">
					<button
						class="p-2.5 rounded-xl text-[var(--color-text-dim)] transition-all duration-200 cursor-pointer
							hover:text-white hover:bg-white/5"
						onclick={togglePassword}
						title={showPassword ? '隐藏密码' : '显示密码'}
					>
						{#if showPassword}
							<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
							</svg>
						{:else}
							<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						{/if}
					</button>
					<button
						class="p-2.5 rounded-xl text-[var(--color-text-dim)] transition-all duration-200 cursor-pointer
							hover:text-white hover:bg-white/5"
						onclick={() => password && copyToClipboard(password, '密码')}
						title="复制密码"
						disabled={!password}
					>
						<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		{#if entry.url}
			<div class="bg-[#111] rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]">
				<div class="flex items-center justify-between gap-3">
					<div class="min-w-0 flex-1">
						<span class="text-xs text-[var(--color-text-dim)] uppercase tracking-widest mb-1.5 block font-medium">网址</span>
						<a
							href={entry.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-[15px] text-[var(--color-text-muted)] hover:text-white transition-colors truncate block"
						>
							{entry.url}
						</a>
					</div>
					<div class="flex items-center gap-1 shrink-0">
						<a
							href={entry.url}
							target="_blank"
							rel="noopener noreferrer"
							class="p-2.5 rounded-xl text-[var(--color-text-dim)] transition-all duration-200
								hover:text-white hover:bg-white/5"
							title="打开网址"
						>
							<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a>
						<button
							class="p-2.5 rounded-xl text-[var(--color-text-dim)] transition-all duration-200 cursor-pointer
								hover:text-white hover:bg-white/5"
							onclick={() => copyToClipboard(entry.url, '网址')}
							title="复制网址"
						>
							<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/if}

		{#if entry.notes}
			<div class="bg-[#111] rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]">
				<span class="text-xs text-[var(--color-text-dim)] uppercase tracking-widest mb-3 block font-medium">备注</span>
				<div class="text-[15px] text-[var(--color-text-muted)] whitespace-pre-wrap break-words leading-relaxed">
					{entry.notes}
				</div>
			</div>
		{/if}

		{#if Object.keys(entry.customFields).length > 0}
			<div class="bg-[#111] rounded-2xl p-5 border border-[rgba(255,255,255,0.06)]">
				<span class="text-xs text-[var(--color-text-dim)] uppercase tracking-widest mb-4 block font-medium">自定义字段</span>
				<div class="flex flex-col gap-3">
					{#each Object.entries(entry.customFields) as [key, value]}
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0 flex-1">
								<div class="text-xs text-[var(--color-text-dim)] mb-1">{key}</div>
								<div class="text-[15px] text-white truncate">{value}</div>
							</div>
							<button
								class="p-2 rounded-lg text-[var(--color-text-dim)] transition-all duration-200 shrink-0 cursor-pointer
									hover:text-white hover:bg-white/5"
								onclick={() => copyToClipboard(value, key)}
								title="复制{key}"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
								</svg>
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<div class="bg-[#111] rounded-2xl px-5 py-3.5 border border-[rgba(255,255,255,0.06)]">
			<div class="flex items-center gap-2.5 text-xs text-[var(--color-text-dim)]">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				最后修改：{formatDate(entry.lastModified)}
			</div>
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center h-full text-[var(--color-text-dim)]">
		<svg class="w-16 h-16 mb-4 opacity-15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
		</svg>
		<p class="text-sm">选择一个条目查看详情</p>
	</div>
{/if}

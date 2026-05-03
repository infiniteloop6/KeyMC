<script lang="ts">
	import { dbStore } from '$lib/stores/database.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import type { GroupDto } from '$lib/kdbx/kdbx-types';

	let { onclose }: { onclose?: () => void } = $props();

	let showNewGroupModal = $state(false);
	let newGroupName = $state('');
	let newGroupParentId = $state('');
	let contextMenuGroupId = $state<string | null>(null);
	let hoveredGroupId = $state<string | null>(null);

	let normalGroups = $derived(dbStore.groups.filter(g => !g.isRecycleBin));
	let recycleBinGroup = $derived(dbStore.groups.find(g => g.isRecycleBin));

	function selectGroup(id: string | null) {
		dbStore.selectedGroupId = id;
		dbStore.selectedEntryId = null;
		contextMenuGroupId = null;
		onclose?.();
	}

	function selectAll() {
		dbStore.selectedGroupId = null;
		dbStore.selectedEntryId = null;
		contextMenuGroupId = null;
		onclose?.();
	}

	function startNewGroup() {
		newGroupParentId = dbStore.selectedGroupId || dbStore.defaultGroupId || '';
		newGroupName = '';
		showNewGroupModal = true;
	}

	function confirmNewGroup() {
		const name = newGroupName.trim();
		if (!name) {
			uiStore.addToast('请输入文件夹名称', 'error');
			return;
		}
		const parentId = newGroupParentId || dbStore.defaultGroupId || '';
		if (!parentId) return;
		try {
			dbStore.createGroup(parentId, name);
			uiStore.addToast(`文件夹「${name}」已创建`, 'success');
		} catch (e) {
			uiStore.addToast(e instanceof Error ? e.message : '创建文件夹失败', 'error');
		}
		showNewGroupModal = false;
		newGroupName = '';
	}

	function handleDeleteGroup(id: string, name: string) {
		if (!confirm(`确定要删除文件夹「${name}」吗？`)) return;
		try {
			dbStore.deleteGroup(id);
			uiStore.addToast(`文件夹「${name}」已删除`, 'success');
		} catch (e) {
			uiStore.addToast(e instanceof Error ? e.message : '删除文件夹失败', 'error');
		}
		contextMenuGroupId = null;
	}

	function toggleContextMenu(id: string) {
		contextMenuGroupId = contextMenuGroupId === id ? null : id;
	}

	function handleClickOutside() {
		if (contextMenuGroupId) contextMenuGroupId = null;
	}
</script>

<svelte:window onclick={handleClickOutside} />

<aside
	class="h-full flex flex-col overflow-hidden transition-all duration-300 border-r border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] w-64 shrink-0"
>
	<div class="p-4 border-b border-[rgba(255,255,255,0.06)]">
		<button
			class="w-full text-left px-4 py-3.5 rounded-xl text-[16px] font-medium transition-all duration-200 cursor-pointer
				{!dbStore.selectedGroupId
					? 'bg-white/10 text-white'
					: 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'}"
			onclick={selectAll}
		>
			<div class="flex items-center gap-3">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
				</svg>
				全部条目
			</div>
		</button>
	</div>

	<div class="flex-1 overflow-y-auto p-3">
		{#each normalGroups as group (group.id)}
			{@render groupItem(group, 0)}
		{/each}

		{#if recycleBinGroup}
			<div class="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
				{@render groupItem(recycleBinGroup, 0)}
			</div>
		{/if}
	</div>

	<div class="p-3 border-t border-[rgba(255,255,255,0.06)]">
		<button
			class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[16px] text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white transition-all cursor-pointer"
			onclick={startNewGroup}
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
			</svg>
			新建文件夹
		</button>
	</div>
</aside>

{#if showNewGroupModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center max-md:items-end" role="dialog" aria-modal="true">
		<button
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
			onclick={() => (showNewGroupModal = false)}
			aria-label="关闭"
		></button>
		<div
			class="relative bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm mx-4 border border-[rgba(255,255,255,0.08)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] max-md:mx-0 max-md:rounded-b-none max-md:max-h-[85vh] max-md:overflow-y-auto"
			role="dialog"
			tabindex="-1"
			onclick={(e: MouseEvent) => e.stopPropagation()}
			onkeydown={(e: KeyboardEvent) => e.stopPropagation()}
		>
			<h3 class="text-lg font-semibold text-white mb-5">新建文件夹</h3>

			<div class="space-y-4">
				<div>
					<label for="new-group-name" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">文件夹名称</label>
					<input
						id="new-group-name"
						type="text"
						bind:value={newGroupName}
						placeholder="输入文件夹名称"
						class="w-full px-4 py-3 bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all"
						onkeydown={(e) => e.key === 'Enter' && confirmNewGroup()}
					/>
				</div>
				<div>
					<label for="new-group-location" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">创建位置</label>
					<select
						id="new-group-location"
						bind:value={newGroupParentId}
						class="w-full px-4 py-3 text-sm rounded-xl bg-[#111] text-white border border-[rgba(255,255,255,0.08)] focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all"
					>
						<option value={dbStore.defaultGroupId || ''}>根目录</option>
						{#each dbStore.flatGroups as g (g.id)}
							{#if !g.isRecycleBin}
								<option value={g.id}>{g.name}</option>
							{/if}
						{/each}
					</select>
				</div>
			</div>

			<div class="flex gap-3 mt-6">
				<button
					class="flex-1 px-4 py-3 text-sm rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
					onclick={confirmNewGroup}
					disabled={!newGroupName.trim()}
				>
					创建
				</button>
				<button
					class="flex-1 px-4 py-3 text-sm rounded-xl text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all cursor-pointer border border-[rgba(255,255,255,0.08)]"
					onclick={() => (showNewGroupModal = false)}
				>
					取消
				</button>
			</div>
		</div>
	</div>
{/if}

{#snippet groupItem(group: GroupDto, depth: number)}
	<div class="relative">
		<button
			class="w-full text-left px-4 py-3 rounded-xl text-[16px] transition-all duration-200 cursor-pointer
				{dbStore.selectedGroupId === group.id
					? 'bg-white/10 text-white'
					: 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'}
				{group.isRecycleBin ? 'opacity-50' : ''}"
			style="padding-left: {16 + depth * 20}px"
			onclick={() => selectGroup(group.id)}
			onmouseenter={() => hoveredGroupId = group.id}
			onmouseleave={() => hoveredGroupId = null}
		>
			<div class="flex items-center gap-3">
				{#if group.isRecycleBin}
					<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				{:else}
					<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
					</svg>
				{/if}
				<span class="truncate flex-1">{group.name}</span>
				<span class="text-xs text-[var(--color-text-dim)] tabular-nums">{group.entryCount}</span>
				{#if !group.isRecycleBin}
					<span
						class="p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer inline-flex items-center justify-center
							{hoveredGroupId === group.id || contextMenuGroupId === group.id ? 'opacity-100' : 'opacity-0'}"
						onclick={(e: MouseEvent) => { e.stopPropagation(); toggleContextMenu(group.id); }}
						title="更多操作"
						role="button"
						tabindex="0"
						onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') { e.stopPropagation(); toggleContextMenu(group.id); } }}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
						</svg>
					</span>
				{/if}
			</div>
		</button>

		{#if contextMenuGroupId === group.id && !group.isRecycleBin}
			<div
				class="absolute left-2 right-2 z-50 bg-[#1c1c1e] rounded-xl py-1.5 border border-[rgba(255,255,255,0.1)] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
				style="top: 100%"
				role="menu"
				tabindex="-1"
				onclick={(e: MouseEvent) => e.stopPropagation()}
				onkeydown={(e: KeyboardEvent) => e.stopPropagation()}
			>
				<button
					class="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3"
					onclick={() => handleDeleteGroup(group.id, group.name)}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					删除文件夹
				</button>
			</div>
		{/if}
	</div>
	{#each group.subGroups as subGroup (subGroup.id)}
		{@render groupItem(subGroup, depth + 1)}
	{/each}
{/snippet}

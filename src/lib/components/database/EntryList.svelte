<script lang="ts">
	import { dbStore } from '$lib/stores/database.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import SearchBar from '$lib/components/common/SearchBar.svelte';
	import EntryCard from '$lib/components/entry/EntryCard.svelte';
	import Button from '$lib/components/common/Button.svelte';

	function selectEntry(id: string) {
		dbStore.selectedEntryId = id;
	}

	function startCreate() {
		uiStore.creatingEntry = true;
	}
</script>

<div class="flex flex-col h-full">
	<div class="bg-[#111] rounded-2xl p-3 md:p-4 mb-3 md:mb-4 border border-[rgba(255,255,255,0.06)]">
		<div class="flex items-center gap-2 md:gap-3">
			<div class="flex-1 min-w-0">
				<SearchBar bind:value={dbStore.searchQuery} placeholder="搜索条目..." />
			</div>
			<button
				class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium text-black bg-white hover:bg-white/90 transition-all cursor-pointer shrink-0"
				onclick={startCreate}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				<span class="hidden sm:inline">新增</span>
			</button>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto pr-1 max-md:pb-20">
		{#if dbStore.entries.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-[var(--color-text-dim)]">
				<svg class="w-14 h-14 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
				</svg>
				<p class="text-sm">暂无条目</p>
			</div>
		{:else}
			{#each dbStore.entries as entry (entry.id)}
				<EntryCard
					{entry}
					selected={dbStore.selectedEntryId === entry.id}
					onclick={() => selectEntry(entry.id)}
				/>
			{/each}
		{/if}
	</div>
</div>

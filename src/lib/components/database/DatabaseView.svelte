<script lang="ts">
	import EntryList from '$lib/components/database/EntryList.svelte';
	import EntryDetail from '$lib/components/entry/EntryDetail.svelte';
	import EntryEditor from '$lib/components/entry/EntryEditor.svelte';
	import { dbStore } from '$lib/stores/database.svelte';

	let showDetail = $derived(!!dbStore.selectedEntryId);
</script>

<div class="h-full flex">
	<div
		class="border-r border-[rgba(255,255,255,0.06)] flex flex-col shrink-0 p-3
			w-80 max-md:w-full max-md:border-r-0 max-md:p-2
			{showDetail ? 'max-md:hidden' : ''}"
	>
		<EntryList />
	</div>

	<div
		class="flex-1 overflow-hidden
			{!showDetail ? 'max-md:hidden' : ''}"
	>
		<EntryDetail />
	</div>

	<EntryEditor />
</div>

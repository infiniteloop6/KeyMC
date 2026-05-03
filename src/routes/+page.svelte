<script lang="ts">
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import UnlockScreen from '$lib/components/database/UnlockScreen.svelte';
	import DatabaseView from '$lib/components/database/DatabaseView.svelte';
	import { dbStore } from '$lib/stores/database.svelte';
</script>

<AppShell>
	{#if dbStore.isLocked}
		<UnlockScreen />
	{:else}
		<DatabaseView />
	{/if}
</AppShell>

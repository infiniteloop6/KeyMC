<script lang="ts">
	import type { Snippet } from 'svelte';
	import Header from './Header.svelte';
	import Sidebar from './Sidebar.svelte';
	import Toast from '$lib/components/common/Toast.svelte';
	import { dbStore } from '$lib/stores/database.svelte';

	let { children }: { children: Snippet } = $props();
	let showMobileSidebar = $state(false);

	$effect(() => {
		if (showMobileSidebar) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	});
</script>

<div class="h-screen flex flex-col bg-surface text-text overflow-hidden">
	<Header />
	<div class="flex flex-1 overflow-hidden">
		{#if !dbStore.isLocked}
			<div class="hidden md:block shrink-0">
				<Sidebar />
			</div>

			{#if showMobileSidebar}
				<button
					class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
					onclick={() => (showMobileSidebar = false)}
					aria-label="关闭侧边栏"
				></button>
				<div class="fixed left-0 top-14 bottom-0 z-50 md:hidden" style="animation: slide-in-left 0.25s ease-out">
					<Sidebar onclose={() => (showMobileSidebar = false)} />
				</div>
			{/if}
		{/if}
		<main class="flex-1 overflow-hidden min-w-0">
			{@render children()}
		</main>
	</div>
	<Toast />
</div>

{#if !dbStore.isLocked}
	<button
		class="fixed bottom-6 left-6 z-30 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.5)] md:hidden transition-transform active:scale-95"
		onclick={() => (showMobileSidebar = !showMobileSidebar)}
		aria-label="菜单"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	</button>
{/if}

<style>
	@keyframes slide-in-left {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}
</style>

<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = '搜索条目...',
		oninput
	}: {
		value?: string;
		placeholder?: string;
		oninput?: (e: Event) => void;
	} = $props();
</script>

<div class="relative">
	<svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--color-text-dim)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
	</svg>
	<input
		type="text"
		bind:value
		{placeholder}
		oninput={oninput}
		class="w-full pl-11 pr-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all"
	/>
	{#if value}
		<button
			class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-white transition-colors cursor-pointer"
			onclick={() => (value = '')} aria-label="清除搜索"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	{/if}
</div>

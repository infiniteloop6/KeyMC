<script lang="ts">
	import { generatePassword, estimateStrength, defaultOptions, type PasswordOptions } from '$lib/kdbx/password-generator';
	import { uiStore } from '$lib/stores/ui.svelte';

	let options = $state<PasswordOptions>({ ...defaultOptions });
	let generated = $state('');
	let strength = $derived(estimateStrength(generated));

	function regenerate() {
		generated = generatePassword(options);
	}

	function copyPassword() {
		navigator.clipboard.writeText(generated);
		uiStore.addToast('密码已复制', 'success');
	}

	$effect(() => {
		generated = generatePassword(options);
	});
</script>

<div class="space-y-3">
	<div class="flex items-center gap-2">
		<div class="flex-1 font-mono text-sm text-white bg-[#0a0a0a] rounded-xl px-3.5 py-2.5 break-all border border-[rgba(255,255,255,0.04)]">
			{generated}
		</div>
		<button
			class="p-2.5 rounded-xl hover:bg-white/5 text-[var(--color-text-dim)] hover:text-white transition-colors cursor-pointer"
			onclick={regenerate}
			title="重新生成"
		>
			<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		</button>
		<button
			class="p-2.5 rounded-xl hover:bg-white/5 text-[var(--color-text-dim)] hover:text-white transition-colors cursor-pointer"
			onclick={copyPassword}
			title="复制"
		>
			<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
			</svg>
		</button>
	</div>

	<div class="flex items-center gap-2">
		<div class="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
			<div
				class="h-full rounded-full transition-all duration-300
					{strength.score <= 2 ? 'bg-[var(--color-danger)]' : strength.score <= 4 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'}"
				style="width: {(strength.score / 8) * 100}%"
			></div>
		</div>
		<span class="text-xs {strength.color}">{strength.label}</span>
	</div>

	<div>
		<div class="flex justify-between text-xs text-[var(--color-text-dim)] mb-1.5">
			<span>长度</span>
			<span>{options.length}</span>
		</div>
		<input
			type="range"
			min="4"
			max="64"
			bind:value={options.length}
			class="w-full accent-white"
		/>
	</div>

	<div class="grid grid-cols-2 gap-2">
		<label class="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
			<input type="checkbox" bind:checked={options.uppercase} class="accent-white" />
			大写字母
		</label>
		<label class="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
			<input type="checkbox" bind:checked={options.lowercase} class="accent-white" />
			小写字母
		</label>
		<label class="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
			<input type="checkbox" bind:checked={options.digits} class="accent-white" />
			数字
		</label>
		<label class="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
			<input type="checkbox" bind:checked={options.symbols} class="accent-white" />
			符号
		</label>
	</div>
</div>

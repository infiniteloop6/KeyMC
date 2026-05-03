<script lang="ts">
	import { dbStore } from '$lib/stores/database.svelte';
	import Button from '$lib/components/common/Button.svelte';

	let showConflictModal = $state(false);
	let showCreateVault = $state(false);
	let newVaultName = $state('');
	let newVaultPassword = $state('');
	let newVaultConfirmPassword = $state('');
	let isCreating = $state(false);

	async function handleSave() {
		await dbStore.saveToCloud();
		if (dbStore.conflict) {
			showConflictModal = true;
		}
	}

	function handleLock() {
		if (dbStore.dirty) {
			if (!confirm('有未保存的更改，确定要锁定吗？')) return;
		}
		dbStore.lock();
	}

	async function handleForceSave() {
		showConflictModal = false;
		await dbStore.forceSaveToCloud();
	}

	async function handlePullAndSave() {
		showConflictModal = false;
		await dbStore.pullAndSave();
	}

	function dismissConflict() {
		showConflictModal = false;
	}

	function openCreateVault() {
		newVaultName = '';
		newVaultPassword = '';
		newVaultConfirmPassword = '';
		showCreateVault = true;
	}

	async function handleCreateVault() {
		if (!newVaultName.trim()) return;
		if (!newVaultPassword) return;
		if (newVaultPassword !== newVaultConfirmPassword) return;
		if (isCreating) return;
		isCreating = true;
		try {
			await dbStore.createVault(newVaultPassword, newVaultName.trim(), newVaultName.trim());
			showCreateVault = false;
		} finally {
			isCreating = false;
		}
	}

	let canCreate = $derived(
		newVaultName.trim() !== '' &&
		newVaultPassword.length > 0 &&
		newVaultPassword === newVaultConfirmPassword
	);
</script>

<header class="h-14 flex items-center justify-between px-4 md:px-5 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a] shrink-0">
	<div class="flex items-center gap-3 md:gap-4">
		<h1 class="text-lg font-bold text-white tracking-tight">
			<span class="text-white">Key</span><span class="text-[var(--color-text-muted)]">MC</span>
		</h1>
		{#if dbStore.fileName}
			<span class="text-xs text-[var(--color-text-dim)] bg-white/5 px-3 py-1.5 rounded-full items-center gap-2 border border-[rgba(255,255,255,0.04)] hidden sm:inline-flex">
				<svg class="w-3.5 h-3.5 text-[var(--color-text-dim)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
				</svg>
				{dbStore.fileName}
				{#if dbStore.dirty}
					<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
				{/if}
			</span>
		{/if}
	</div>

	<div class="flex items-center gap-1">
		{#if dbStore.isLocked}
			<Button variant="ghost" size="sm" onclick={openCreateVault}>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
				</svg>
				<span class="hidden sm:inline">新建密码库</span>
			</Button>
		{:else}
			{#if dbStore.isSaving}
				<span class="text-xs text-[var(--color-text-muted)] flex items-center gap-2 px-3">
					<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					同步中...
				</span>
			{:else}
				{#if dbStore.conflict}
					<Button variant="ghost" size="sm" onclick={() => showConflictModal = true} class="text-[var(--color-danger)]!">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
						</svg>
						<span class="hidden sm:inline">冲突</span>
					</Button>
				{/if}
				<Button variant="ghost" size="sm" onclick={handleSave}>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
					</svg>
					<span class="hidden sm:inline">保存{#if dbStore.dirty} *{/if}</span>
				</Button>
			{/if}
			<Button variant="ghost" size="sm" onclick={handleLock}>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
				</svg>
				<span class="hidden sm:inline">锁定</span>
			</Button>
		{/if}
	</div>
</header>

{#if showCreateVault}
	<div class="fixed inset-0 z-50 flex items-center justify-center max-md:items-end" role="dialog" aria-modal="true" tabindex="-1">
		<button
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
			onclick={() => showCreateVault = false}
			aria-label="关闭"
		></button>
		<div class="relative bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm mx-4 border border-[rgba(255,255,255,0.08)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] max-md:mx-0 max-md:rounded-b-none max-md:max-h-[85vh] max-md:overflow-y-auto">
			<div class="flex items-center gap-3 mb-5">
				<div class="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
					<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-white">新建密码库</h3>
			</div>

			<div class="space-y-4">
				<div>
					<label for="vault-name" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">
						密码库名称
					</label>
					<input
						id="vault-name"
						type="text"
						bind:value={newVaultName}
						placeholder="例如：我的密码库"
						onkeydown={(e) => e.key === 'Enter' && canCreate && handleCreateVault()}
						class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-[var(--color-text-dim)] outline-none transition-all bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] focus:border-white/20 focus:ring-2 focus:ring-white/5"
					/>
				</div>

				<div>
					<label for="vault-password" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">
						主密码
					</label>
					<input
						id="vault-password"
						type="password"
						bind:value={newVaultPassword}
						placeholder="设置主密码"
						onkeydown={(e) => e.key === 'Enter' && canCreate && handleCreateVault()}
						class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-[var(--color-text-dim)] outline-none transition-all bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] focus:border-white/20 focus:ring-2 focus:ring-white/5"
					/>
				</div>

				<div>
					<label for="vault-confirm-password" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">
						确认主密码
					</label>
					<input
						id="vault-confirm-password"
						type="password"
						bind:value={newVaultConfirmPassword}
						placeholder="再次输入主密码"
						onkeydown={(e) => e.key === 'Enter' && canCreate && handleCreateVault()}
						class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-[var(--color-text-dim)] outline-none transition-all bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] focus:border-white/20 focus:ring-2 focus:ring-white/5"
					/>
					{#if newVaultConfirmPassword && newVaultPassword !== newVaultConfirmPassword}
						<p class="text-xs text-[var(--color-danger)] mt-1.5">两次输入的密码不一致</p>
					{/if}
				</div>

				<div class="flex gap-3 pt-2">
					<button
						class="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all cursor-pointer border border-[rgba(255,255,255,0.08)]"
						onclick={() => showCreateVault = false}
					>
						取消
					</button>
					<button
						class="flex-1 px-4 py-3 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						onclick={handleCreateVault}
						disabled={!canCreate || isCreating}
					>
						{#if isCreating}
							<svg class="w-4 h-4 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{:else}
							创建并下载
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if showConflictModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center max-md:items-end" role="dialog" aria-modal="true" tabindex="-1">
		<button
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
			onclick={dismissConflict}
			aria-label="关闭"
		></button>
		<div class="relative bg-[#1c1c1e] rounded-2xl p-6 w-full max-w-sm mx-4 border border-[rgba(255,69,58,0.2)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] max-md:mx-0 max-md:rounded-b-none max-md:max-h-[85vh] max-md:overflow-y-auto">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 rounded-xl bg-[rgba(255,69,58,0.1)] flex items-center justify-center shrink-0">
					<svg class="w-5 h-5 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold text-white">保存冲突</h3>
			</div>

			<p class="text-sm text-[var(--color-text-muted)] mb-5">
				远程文件已被其他设备修改。你的本地更改与远程版本存在冲突，请选择如何处理：
			</p>

			<div class="space-y-3">
				<button
					class="w-full text-left p-4 rounded-xl border border-[rgba(255,255,255,0.08)] hover:bg-white/5 transition-all cursor-pointer"
					onclick={handleForceSave}
				>
					<div class="flex items-center gap-3 mb-1">
						<svg class="w-4 h-4 text-[var(--color-danger)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-sm font-medium text-white">覆盖远程版本</span>
					</div>
					<p class="text-xs text-[var(--color-text-dim)] ml-7">
						用本地版本覆盖远程文件，远程的修改将丢失
					</p>
				</button>

				<button
					class="w-full text-left p-4 rounded-xl border border-[rgba(255,255,255,0.08)] hover:bg-white/5 transition-all cursor-pointer"
					onclick={handlePullAndSave}
				>
					<div class="flex items-center gap-3 mb-1">
						<svg class="w-4 h-4 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
						</svg>
						<span class="text-sm font-medium text-white">拉取远程并重新保存</span>
					</div>
					<p class="text-xs text-[var(--color-text-dim)] ml-7">
						先拉取远程最新版本，然后用本地版本覆盖保存
					</p>
				</button>

				<button
					class="w-full text-left p-4 rounded-xl border border-[rgba(255,255,255,0.08)] hover:bg-white/5 transition-all cursor-pointer"
					onclick={dismissConflict}
				>
					<div class="flex items-center gap-3 mb-1">
						<svg class="w-4 h-4 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
						</svg>
						<span class="text-sm font-medium text-[var(--color-text-muted)]">取消</span>
					</div>
					<p class="text-xs text-[var(--color-text-dim)] ml-7">
						暂不保存，稍后处理
					</p>
				</button>
			</div>
		</div>
	</div>
{/if}

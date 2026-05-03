<script lang="ts">
	import { dbStore } from '$lib/stores/database.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import R2FilePicker from '$lib/components/database/R2FilePicker.svelte';

	let accessToken = $state('');
	let masterPassword = $state('');
	let showPassword = $state(false);
	let fileData: ArrayBuffer | null = $state(null);
	let isLoggingIn = $state(false);

	$effect(() => {
		if (!authStore.isAuthenticated) {
			fileData = null;
			masterPassword = '';
		}
	});

	async function handleLogin() {
		if (!accessToken.trim()) return;
		isLoggingIn = true;
		try {
			await authStore.login(accessToken.trim());
		} catch {
		} finally {
			isLoggingIn = false;
		}
	}

	function handleCloudSelect(data: ArrayBuffer, fileKey: string, fileName: string) {
		fileData = data;
		dbStore.fileName = fileName;
		dbStore.fileKey = fileKey;
		dbStore.fileSource = true;
	}

	async function handleUnlock() {
		if (!fileData || !masterPassword) return;
		try {
			await dbStore.openDatabase(fileData, masterPassword);
			masterPassword = '';
			uiStore.addToast('数据库已解锁', 'success');
		} catch {
		}
	}
</script>

<div class="h-full flex items-center justify-center p-4 md:p-6">
	<div class="w-full max-w-md animate-slide-up">
		<div class="text-center mb-10">
			<div class="relative inline-block mb-5">
				<div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-[rgba(255,255,255,0.06)]">
					<svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
			</div>
			<h1 class="text-3xl font-bold text-white tracking-tight">
				Key<span class="text-[var(--color-text-muted)]">MC</span>
			</h1>
			<p class="text-[var(--color-text-muted)] mt-2 text-sm">安全的云端密码管理器</p>
		</div>

		<div class="bg-[#111] rounded-2xl p-5 md:p-6 border border-[rgba(255,255,255,0.06)]">
			{#if !authStore.isAuthenticated}
				<div class="mb-5">
					<label for="access-token" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">
						访问令牌
					</label>
					<div class="flex gap-2">
						<input
							id="access-token"
							type="password"
							bind:value={accessToken}
							placeholder="输入访问令牌"
							onkeydown={(e) => e.key === 'Enter' && handleLogin()}
							class="flex-1 px-4 py-3 rounded-xl text-white text-sm placeholder:text-[var(--color-text-dim)] outline-none transition-all bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] focus:border-white/20 focus:ring-2 focus:ring-white/5"
						/>
						<button
							class="px-5 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-all cursor-pointer border border-[rgba(255,255,255,0.08)] bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
							onclick={handleLogin}
							disabled={!accessToken.trim() || isLoggingIn}
						>
							{#if isLoggingIn}
								<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
							{:else}
								连接
							{/if}
						</button>
					</div>
					<p class="text-xs text-[var(--color-text-dim)] mt-2">
						访问令牌在 Cloudflare Pages 环境变量中设置
					</p>
				</div>
			{:else}
				<div class="flex gap-3">
					<div class="flex-1">
						<R2FilePicker onselect={handleCloudSelect} />
					</div>
					<button
						class="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-all cursor-pointer border border-[rgba(255,255,255,0.08)] shrink-0"
						onclick={() => authStore.logout()}
					>
						退出
					</button>
				</div>
				<p class="text-sm text-[var(--color-text-muted)] mt-2">
					已连接云端
				</p>
			{/if}

			{#if fileData}
				<div class="mt-4 p-3.5 rounded-xl flex items-center gap-2.5 bg-white/[0.03] border border-[rgba(52,199,89,0.15)]">
					<svg class="w-5 h-5 text-[var(--color-success)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="text-sm font-medium text-[var(--color-success)]">{dbStore.fileName}</span>
					<span class="text-xs px-2 py-0.5 rounded-md bg-white/5 text-[var(--color-text-muted)]">
						云端
					</span>
				</div>
			{/if}

			<div class="my-5 h-px bg-[rgba(255,255,255,0.06)]"></div>

			<div class="mb-5">
				<label for="master-password" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">
					主密码
				</label>
				<div class="relative">
					<input
						id="master-password"
						type={showPassword ? 'text' : 'password'}
						bind:value={masterPassword}
						placeholder="输入主密码"
						onkeydown={(e) => e.key === 'Enter' && handleUnlock()}
						class="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-[var(--color-text-dim)] outline-none transition-all pr-12 bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] focus:border-white/20 focus:ring-2 focus:ring-white/5"
					/>
					<button
						class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)] hover:text-white transition-colors cursor-pointer"
						onclick={() => (showPassword = !showPassword)}
						type="button"
						aria-label={showPassword ? '隐藏密码' : '显示密码'}
					>
						{#if showPassword}
							<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
								/>
							</svg>
						{:else}
							<svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>

			{#if dbStore.error}
				<div
					class="mb-5 p-3.5 rounded-xl text-sm flex items-center gap-2.5 bg-[rgba(255,69,58,0.06)] border border-[rgba(255,69,58,0.15)] text-[var(--color-danger)]"
				>
					<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{dbStore.error}
				</div>
			{/if}

			<button
				class="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
					bg-white text-black hover:bg-white/90
					disabled:opacity-30 disabled:cursor-not-allowed"
				disabled={!fileData || !masterPassword || dbStore.isLoading}
				onclick={handleUnlock}
			>
				{#if dbStore.isLoading}
					<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					解密中...
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
						/>
					</svg>
					解锁
				{/if}
			</button>
		</div>

		<p class="text-center text-xs text-[var(--color-text-dim)] mt-5">
			你的主密码永远不会离开浏览器
		</p>
	</div>
</div>

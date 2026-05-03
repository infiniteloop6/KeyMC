<script lang="ts">
	import { dbStore } from '$lib/stores/database.svelte';
	import { uiStore } from '$lib/stores/ui.svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import PasswordGenerator from '$lib/components/entry/PasswordGenerator.svelte';

	let title = $state('');
	let userName = $state('');
	let password = $state('');
	let url = $state('');
	let notes = $state('');
	let showGenerator = $state(false);
	let groupId = $state('');

	$effect(() => {
		if (uiStore.editingEntry && dbStore.selectedEntry) {
			const e = dbStore.selectedEntry;
			title = e.title;
			userName = e.userName;
			password = '';
			url = e.url;
			notes = e.notes;
			groupId = e.groupId;
		} else if (uiStore.creatingEntry) {
			title = '';
			userName = '';
			password = '';
			url = '';
			notes = '';
			groupId = dbStore.selectedGroupId || dbStore.defaultGroupId || dbStore.flatGroups[0]?.id || '';
		}
	});

	function handleSave() {
		const fields: Record<string, string | undefined> = {
			title,
			userName,
			url,
			notes,
		};
		if (password) fields.password = password;

		try {
			if (uiStore.editingEntry && dbStore.selectedEntryId) {
				dbStore.updateEntry(dbStore.selectedEntryId, fields);
				uiStore.addToast('条目已更新', 'success');
			} else if (uiStore.creatingEntry) {
				const gid = groupId || dbStore.defaultGroupId || dbStore.flatGroups[0]?.id || '';
				if (!gid) {
					uiStore.addToast('请先选择一个分组', 'error');
					return;
				}
				dbStore.createEntry(gid, fields);
				uiStore.addToast('条目已创建', 'success');
			}
			close();
		} catch (e) {
			uiStore.addToast(e instanceof Error ? e.message : '保存失败', 'error');
		}
	}

	function close() {
		uiStore.editingEntry = false;
		uiStore.creatingEntry = false;
		showGenerator = false;
	}

	let isOpen = $derived(uiStore.editingEntry || uiStore.creatingEntry);

	const inputClass = 'w-full px-3.5 py-3 bg-[#111] border border-[rgba(255,255,255,0.08)] rounded-xl text-white text-sm placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all';
</script>

<Modal
	open={isOpen}
	title={uiStore.editingEntry ? '编辑条目' : '新增条目'}
	onclose={close}
>
	<div class="space-y-5">
		<div>
			<label for="entry-title" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">标题</label>
			<input
				id="entry-title"
				type="text"
				bind:value={title}
				placeholder="例如：GitHub"
				class={inputClass}
			/>
		</div>

		<div>
			<label for="entry-username" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">用户名</label>
			<input
				id="entry-username"
				type="text"
				bind:value={userName}
				placeholder="用户名或邮箱"
				class={inputClass}
			/>
		</div>

		<div>
			<label for="entry-password" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">密码</label>
			<div class="flex gap-2">
				<input
					id="entry-password"
					type="text"
					bind:value={password}
					placeholder={uiStore.editingEntry ? '留空保持不变' : '输入密码'}
					class="{inputClass} flex-1 font-mono"
				/>
				<Button
					variant="secondary"
					size="sm"
					onclick={() => (showGenerator = !showGenerator)}
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
					</svg>
				</Button>
			</div>
			{#if showGenerator}
				<div class="mt-3 p-4 bg-[#111] rounded-xl border border-[rgba(255,255,255,0.06)]">
					<PasswordGenerator />
					<Button
						variant="ghost"
						size="sm"
						class="mt-2"
						onclick={() => { showGenerator = false; }}
					>
						关闭生成器
					</Button>
				</div>
			{/if}
		</div>

		<div>
			<label for="entry-url" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">网址</label>
			<input
				id="entry-url"
				type="url"
				bind:value={url}
				placeholder="https://"
				class={inputClass}
			/>
		</div>

		<div>
			<label for="entry-notes" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">备注</label>
			<textarea
				id="entry-notes"
				bind:value={notes}
				placeholder="可选备注"
				rows="3"
				class="{inputClass} resize-none"
			></textarea>
		</div>

		{#if uiStore.creatingEntry}
			<div>
				<label for="entry-group" class="block text-xs font-medium text-[var(--color-text-muted)] mb-2 tracking-wide">分组</label>
				<select
					id="entry-group"
					bind:value={groupId}
					class="{inputClass} appearance-none"
				>
					{#each dbStore.flatGroups as group (group.id)}
						<option value={group.id}>{group.name}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="secondary" onclick={close}>取消</Button>
			<Button variant="primary" onclick={handleSave} disabled={!title.trim()}>
				{uiStore.editingEntry ? '保存修改' : '创建条目'}
			</Button>
		</div>
	</div>
</Modal>

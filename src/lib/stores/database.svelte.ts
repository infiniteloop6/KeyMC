import { kdbxService } from '$lib/kdbx/kdbx-service';
import type { EntryDto, GroupDto } from '$lib/kdbx/kdbx-types';
import { r2Client } from '$lib/r2/r2-client';
import type { ConflictInfo } from '$lib/r2/types';
import { uiStore } from './ui.svelte';

class DatabaseStore {
	isLocked = $state(true);
	isLoading = $state(false);
	isSaving = $state(false);
	error = $state<string | null>(null);
	selectedGroupId = $state<string | null>(null);
	selectedEntryId = $state<string | null>(null);
	searchQuery = $state('');
	dirty = $state(false);
	fileKey = $state<string | null>(null);
	fileName = $state<string | null>(null);
	fileSource = $state<boolean>(false);
	remoteEtag = $state<string | null>(null);
	conflict = $state<ConflictInfo | null>(null);
	private _rev = $state(0);

	entries = $derived.by(() => {
		const _ = this._rev;
		if (kdbxService.isLocked) return [];
		if (this.searchQuery.trim()) {
			return kdbxService.searchEntries(this.searchQuery);
		}
		if (this.selectedGroupId) {
			return kdbxService.getEntries(this.selectedGroupId);
		}
		return kdbxService.getAllEntries();
	});

	groups = $derived.by(() => {
		const _ = this._rev;
		if (kdbxService.isLocked) return [];
		return kdbxService.getGroups();
	});

	flatGroups = $derived.by(() => {
		const _ = this._rev;
		if (kdbxService.isLocked) return [];
		return kdbxService.flattenGroups();
	});

	defaultGroupId = $derived.by(() => {
		const _ = this._rev;
		return kdbxService.getDefaultGroupId();
	});

	selectedEntry = $derived.by(() => {
		const _ = this._rev;
		if (!this.selectedEntryId) return null;
		return kdbxService.getEntry(this.selectedEntryId) ?? null;
	});

	private touch() {
		this._rev++;
	}

	async saveToCloud(): Promise<void> {
		if (!this.fileKey) {
			uiStore.addToast('未选择云端文件，无法保存', 'error');
			return;
		}
		if (this.isSaving) return;
		this.isSaving = true;
		this.conflict = null;
		try {
			const data = await kdbxService.save();
			if (data.byteLength === 0) {
				throw new Error('保存失败：数据库序列化结果为空');
			}

			const result = await r2Client.uploadFile(this.fileKey, data, this.remoteEtag || undefined);
			this.remoteEtag = result.etag;
			this.dirty = false;
			uiStore.addToast('已保存到云端', 'success');
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : '保存到云端失败';

			if (message.includes('CONFLICT') || message.includes('已被修改')) {
				try {
					const conflictInfo = await r2Client.checkConflict(this.fileKey, this.remoteEtag || '');
					if (conflictInfo) {
						this.conflict = conflictInfo;
						uiStore.addToast('远程文件已被修改，存在冲突', 'error');
					} else {
						uiStore.addToast('保存冲突，请重试', 'error');
					}
				} catch {
					uiStore.addToast('保存冲突，请重新打开文件', 'error');
				}
			} else {
				uiStore.addToast(message, 'error');
			}
		} finally {
			this.isSaving = false;
		}
	}

	async forceSaveToCloud(): Promise<void> {
		if (!this.fileKey) return;
		this.isSaving = true;
		this.conflict = null;
		try {
			const data = await kdbxService.save();
			const result = await r2Client.uploadFile(this.fileKey, data);
			this.remoteEtag = result.etag;
			this.dirty = false;
			uiStore.addToast('已强制保存到云端（覆盖远程版本）', 'success');
		} catch (e) {
			const msg = e instanceof Error ? e.message : '强制保存失败';
			uiStore.addToast(msg, 'error');
		} finally {
			this.isSaving = false;
		}
	}

	async pullAndSave(): Promise<void> {
		if (!this.fileKey) return;
		this.isSaving = true;
		this.conflict = null;
		try {
			const localData = await kdbxService.save();
			const { data: remoteData, etag } = await r2Client.getFileContent(this.fileKey);
			this.remoteEtag = etag;

			const result = await r2Client.uploadFile(this.fileKey, localData);
			this.remoteEtag = result.etag;
			this.dirty = false;
			uiStore.addToast('已拉取远程版本并重新保存', 'success');
		} catch (e) {
			const msg = e instanceof Error ? e.message : '拉取并保存失败';
			uiStore.addToast(msg, 'error');
		} finally {
			this.isSaving = false;
		}
	}

	async createVault(masterPassword: string, name: string, fileName: string): Promise<void> {
		this.isLoading = true;
		this.error = null;
		try {
			const data = await kdbxService.create(masterPassword, name);
			if (data.byteLength === 0) {
				throw new Error('创建密码库失败：序列化结果为空');
			}
			const key = fileName.endsWith('.kdbx') ? fileName : `${fileName}.kdbx`;
			const blob = new Blob([data], { type: 'application/octet-stream' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = key;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			uiStore.addToast('密码库已创建并下载，请手动上传到 R2 存储桶', 'success');
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : '创建密码库失败';
			this.error = message;
			uiStore.addToast(message, 'error');
			throw e;
		} finally {
			this.isLoading = false;
		}
	}

	async openDatabase(data: ArrayBuffer, masterPassword: string): Promise<void> {
		this.isLoading = true;
		this.error = null;
		try {
			await kdbxService.open(data, masterPassword);
			this.isLocked = false;
			this.dirty = false;
			this.touch();
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Failed to open database';
			this.error = message.includes('InvalidKey') ? '主密码不正确' : message;
			throw e;
		} finally {
			this.isLoading = false;
		}
	}

	async saveDatabase(): Promise<ArrayBuffer> {
		const data = await kdbxService.save();
		this.dirty = false;
		return data;
	}

	createEntry(groupId: string, fields: Partial<EntryDto>): EntryDto {
		const entry = kdbxService.createEntry(groupId, fields);
		this.dirty = true;
		this.selectedEntryId = entry.id;
		this.touch();
		return entry;
	}

	updateEntry(id: string, fields: Partial<EntryDto>): EntryDto {
		const entry = kdbxService.updateEntry(id, fields);
		this.dirty = true;
		this.touch();
		return entry;
	}

	deleteEntry(id: string): void {
		kdbxService.deleteEntry(id);
		if (this.selectedEntryId === id) {
			this.selectedEntryId = null;
		}
		this.dirty = true;
		this.touch();
	}

	createGroup(parentId: string, name: string): GroupDto {
		const group = kdbxService.createGroup(parentId, name);
		this.dirty = true;
		this.touch();
		return group;
	}

	deleteGroup(id: string): void {
		kdbxService.deleteGroup(id);
		if (this.selectedGroupId === id) {
			this.selectedGroupId = null;
		}
		this.dirty = true;
		this.touch();
	}

	lock(): void {
		kdbxService.close();
		this.isLocked = true;
		this.selectedGroupId = null;
		this.selectedEntryId = null;
		this.searchQuery = '';
		this.dirty = false;
		this.error = null;
		this.fileKey = null;
		this.fileName = null;
		this.fileSource = false;
		this.remoteEtag = null;
		this.conflict = null;
		this.touch();
	}
}

export const dbStore = new DatabaseStore();

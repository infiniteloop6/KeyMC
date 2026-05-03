import type { EntryDto, GroupDto } from './kdbx-types';
import { initArgon2 } from './argon2-setup';

let Kdbx: typeof import('kdbxweb').Kdbx;
let KdbxCredentials: typeof import('kdbxweb').KdbxCredentials;
let ProtectedValue: typeof import('kdbxweb').ProtectedValue;

type KdbxInstance = InstanceType<typeof import('kdbxweb').Kdbx>;
type KdbxEntryInstance = InstanceType<typeof import('kdbxweb').KdbxEntry>;
type KdbxGroupInstance = InstanceType<typeof import('kdbxweb').KdbxGroup>;

let kdbxwebLoaded = false;

async function ensureKdbxweb() {
	if (kdbxwebLoaded) return;
	const kdbxweb = await import('kdbxweb');
	Kdbx = kdbxweb.Kdbx;
	KdbxCredentials = kdbxweb.KdbxCredentials;
	ProtectedValue = kdbxweb.ProtectedValue;
	kdbxwebLoaded = true;
}

class KdbxService {
	private db: KdbxInstance | null = null;

	get isLocked(): boolean {
		return this.db === null;
	}

	async open(data: ArrayBuffer, masterPassword: string): Promise<void> {
		await ensureKdbxweb();
		await initArgon2();
		const credentials = new KdbxCredentials(ProtectedValue.fromString(masterPassword));
		try {
			this.db = await Kdbx.load(data, credentials);
		} catch (e: unknown) {
			this.db = null;
			throw e;
		}
	}

	async save(): Promise<ArrayBuffer> {
		if (!this.db) throw new Error('No database open');
		return this.db.save();
	}

	async create(masterPassword: string, name: string = 'KeyM'): Promise<ArrayBuffer> {
		await ensureKdbxweb();
		await initArgon2();
		const credentials = new KdbxCredentials(ProtectedValue.fromString(masterPassword));
		this.db = Kdbx.create(credentials, name);
		const data = await this.db.save();
		this.db = null;
		return data;
	}

	close(): void {
		this.db = null;
	}

	getEntries(groupId?: string): EntryDto[] {
		if (!this.db) return [];
		const group = groupId ? this.findGroup(groupId) : this.db.getDefaultGroup();
		if (!group) return [];
		return group.entries.map(e => this.entryToDto(e));
	}

	getAllEntries(): EntryDto[] {
		if (!this.db) return [];
		const recycleBinId = this.db.meta.recycleBinUuid?.id;
		return [...this.db.getDefaultGroup().allEntries()]
			.filter(e => !recycleBinId || !this.isInRecycleBin(e.parentGroup))
			.map(e => this.entryToDto(e));
	}

	getEntry(id: string): EntryDto | undefined {
		if (!this.db) return undefined;
		const entry = this.findEntry(id);
		return entry ? this.entryToDto(entry) : undefined;
	}

	createEntry(groupId: string, fields: Partial<EntryDto>): EntryDto {
		if (!this.db || !kdbxwebLoaded) throw new Error('No database open');
		const group = this.findGroup(groupId);
		if (!group) throw new Error('Group not found');
		const entry = this.db.createEntry(group);
		this.setEntryFields(entry, fields);
		entry.pushHistory();
		return this.entryToDto(entry);
	}

	updateEntry(id: string, fields: Partial<EntryDto>): EntryDto {
		if (!this.db) throw new Error('No database open');
		const entry = this.findEntry(id);
		if (!entry) throw new Error('Entry not found');
		entry.pushHistory();
		this.setEntryFields(entry, fields);
		return this.entryToDto(entry);
	}

	deleteEntry(id: string): void {
		if (!this.db) throw new Error('No database open');
		const entry = this.findEntry(id);
		if (!entry) throw new Error('Entry not found');
		if (this.isInRecycleBin(entry.parentGroup)) {
			const parent = entry.parentGroup;
			if (parent) {
				const ix = parent.entries.indexOf(entry);
				if (ix >= 0) parent.entries.splice(ix, 1);
			}
			this.db.addDeletedObject(entry.uuid, new Date());
			entry.parentGroup = undefined;
		} else {
			this.db.remove(entry);
		}
	}

	searchEntries(query: string): EntryDto[] {
		if (!this.db || !query.trim()) return [];
		const q = query.toLowerCase();
		const recycleBinId = this.db.meta.recycleBinUuid?.id;
		return [...this.db.getDefaultGroup().allEntries()]
			.filter(entry => {
				if (recycleBinId && this.isInRecycleBin(entry.parentGroup)) return false;
				const title = (entry.fields.get('Title') as string) ?? '';
				const userName = (entry.fields.get('UserName') as string) ?? '';
				const url = (entry.fields.get('URL') as string) ?? '';
				const notes = (entry.fields.get('Notes') as string) ?? '';
				return title.toLowerCase().includes(q) ||
					userName.toLowerCase().includes(q) ||
					url.toLowerCase().includes(q) ||
					notes.toLowerCase().includes(q);
			})
			.map(e => this.entryToDto(e));
	}

	getEntryPassword(id: string): string {
		if (!this.db || !kdbxwebLoaded) throw new Error('No database open');
		const entry = this.findEntry(id);
		if (!entry) throw new Error('Entry not found');
		const pw = entry.fields.get('Password');
		if (pw instanceof ProtectedValue) return pw.getText();
		return (pw as string) ?? '';
	}

	getDefaultGroupId(): string | null {
		if (!this.db) return null;
		return this.db.getDefaultGroup().uuid.id;
	}

	flattenGroups(): GroupDto[] {
		if (!this.db) return [];
		const result: GroupDto[] = [];
		const root = this.db.getDefaultGroup();
		const walk = (groups: KdbxGroupInstance[], parentId: string | null) => {
			for (const group of groups) {
				result.push(this.groupToDto(group, parentId));
				walk(group.groups, group.uuid.id);
			}
		};
		walk(root.groups, root.uuid.id);
		return result;
	}

	getGroups(): GroupDto[] {
		if (!this.db) return [];
		return this.buildGroupTree(this.db.getDefaultGroup(), null);
	}

	createGroup(parentId: string, name: string): GroupDto {
		if (!this.db || !kdbxwebLoaded) throw new Error('No database open');
		const parent = this.findGroup(parentId);
		if (!parent) throw new Error('Parent group not found');
		const group = this.db.createGroup(parent, name);
		return this.groupToDto(group, parentId);
	}

	deleteGroup(id: string): void {
		if (!this.db) throw new Error('No database open');
		const group = this.findGroup(id);
		if (!group) throw new Error('Group not found');

		const parentGroup = group.parentGroup || this.db.getDefaultGroup();

		for (const entry of [...group.entries]) {
			parentGroup.entries.push(entry);
			entry.parentGroup = parentGroup;
		}

		for (const subGroup of [...group.groups]) {
			this.moveGroupToParent(subGroup, parentGroup);
		}

		if (group.parentGroup) {
			const ix = group.parentGroup.groups.indexOf(group);
			if (ix >= 0) group.parentGroup.groups.splice(ix, 1);
		}

		this.db.addDeletedObject(group.uuid, new Date());
		group.parentGroup = undefined;
	}

	private moveGroupToParent(group: KdbxGroupInstance, newParent: KdbxGroupInstance): void {
		if (!this.db) return;
		const oldParent = group.parentGroup;
		if (oldParent) {
			const ix = oldParent.groups.indexOf(group);
			if (ix >= 0) oldParent.groups.splice(ix, 1);
		}
		newParent.groups.push(group);
		group.parentGroup = newParent;
	}

	private isInRecycleBin(group: KdbxGroupInstance | undefined): boolean {
		if (!this.db || !group) return false;
		const recycleBinId = this.db.meta.recycleBinUuid?.id;
		if (!recycleBinId) return false;
		let current: KdbxGroupInstance | undefined = group;
		while (current) {
			if (current.uuid.id === recycleBinId) return true;
			current = current.parentGroup;
		}
		return false;
	}

	private entryToDto(entry: KdbxEntryInstance): EntryDto {
		const customFields: Record<string, string> = {};
		const standardFields = new Set(['Title', 'UserName', 'Password', 'URL', 'Notes']);
		for (const [key, value] of entry.fields) {
			if (!standardFields.has(key)) {
				customFields[key] = value instanceof ProtectedValue ? value.getText() : (value as string);
			}
		}
		return {
			id: entry.uuid.id,
			title: (entry.fields.get('Title') as string) ?? '',
			userName: (entry.fields.get('UserName') as string) ?? '',
			password: '',
			url: (entry.fields.get('URL') as string) ?? '',
			notes: (entry.fields.get('Notes') as string) ?? '',
			groupId: entry.parentGroup?.uuid.id ?? '',
			icon: entry.icon ?? 0,
			lastModified: entry.times.lastModTime ?? new Date(),
			customFields
		};
	}

	private setEntryFields(entry: KdbxEntryInstance, fields: Partial<EntryDto>): void {
		if (fields.title !== undefined) entry.fields.set('Title', fields.title);
		if (fields.userName !== undefined) entry.fields.set('UserName', fields.userName);
		if (fields.password !== undefined) entry.fields.set('Password', ProtectedValue.fromString(fields.password));
		if (fields.url !== undefined) entry.fields.set('URL', fields.url);
		if (fields.notes !== undefined) entry.fields.set('Notes', fields.notes);
	}

	private groupToDto(group: KdbxGroupInstance, parentId: string | null): GroupDto {
		return {
			id: group.uuid.id,
			name: group.name ?? '',
			icon: group.icon ?? 0,
			parentId,
			entryCount: group.entries.length,
			subGroups: [],
			isRecycleBin: this.db?.meta.recycleBinUuid?.id === group.uuid.id
		};
	}

	private buildGroupTree(group: KdbxGroupInstance, parentId: string | null): GroupDto[] {
		const result: GroupDto[] = [];
		for (const sub of group.groups) {
			const dto = this.groupToDto(sub, parentId);
			dto.subGroups = this.buildGroupTree(sub, sub.uuid.id);
			result.push(dto);
		}
		return result;
	}

	private findGroup(id: string): KdbxGroupInstance | undefined {
		if (!this.db) return undefined;
		return this.findGroupInTree(this.db.getDefaultGroup(), id);
	}

	private findGroupInTree(group: KdbxGroupInstance, id: string): KdbxGroupInstance | undefined {
		if (group.uuid.id === id) return group;
		for (const sub of group.groups) {
			const found = this.findGroupInTree(sub, id);
			if (found) return found;
		}
		return undefined;
	}

	private findEntry(id: string): KdbxEntryInstance | undefined {
		if (!this.db) return undefined;
		for (const entry of this.db.getDefaultGroup().allEntries()) {
			if (entry.uuid.id === id) return entry;
		}
		return undefined;
	}
}

export const kdbxService = new KdbxService();

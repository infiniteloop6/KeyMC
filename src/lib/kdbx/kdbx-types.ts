export interface EntryDto {
	id: string;
	title: string;
	userName: string;
	password: string;
	url: string;
	notes: string;
	groupId: string;
	icon: number;
	lastModified: Date;
	customFields: Record<string, string>;
}

export interface GroupDto {
	id: string;
	name: string;
	icon: number;
	parentId: string | null;
	entryCount: number;
	subGroups: GroupDto[];
	isRecycleBin: boolean;
}

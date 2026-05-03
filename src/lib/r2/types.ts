export interface R2File {
	key: string;
	size: number;
	lastModified: string;
	etag: string;
}

export interface R2FileContent {
	data: ArrayBuffer;
	etag: string;
}

export interface ConflictInfo {
	remoteEtag: string;
	localEtag: string;
	remoteSize: number;
	remoteLastModified: string;
}

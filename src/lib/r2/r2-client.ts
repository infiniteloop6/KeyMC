import type { R2File, R2FileContent, ConflictInfo } from './types';

const TOKEN_KEY = 'keym_access_token';

class R2Client {
	private token = '';
	private baseUrl = '';

	constructor() {
		this.baseUrl = '';
	}

	setToken(token: string): void {
		this.token = token;
		localStorage.setItem(TOKEN_KEY, token);
	}

	clearToken(): void {
		this.token = '';
		localStorage.removeItem(TOKEN_KEY);
	}

	getToken(): string {
		if (!this.token) {
			this.token = localStorage.getItem(TOKEN_KEY) || '';
		}
		return this.token;
	}

	get isAuthenticated(): boolean {
		return !!this.getToken();
	}

	private async apiFetch(path: string, options?: RequestInit): Promise<Response> {
		const token = this.getToken();
		if (!token) throw new Error('未登录，请输入访问令牌');

		const response = await fetch(`/api${path}`, {
			...options,
			headers: {
				Authorization: `Bearer ${token}`,
				...options?.headers
			}
		});

		if (response.status === 401) {
			this.clearToken();
			throw new Error('访问令牌无效或已过期');
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.error || `API error: ${response.status}`);
		}

		return response;
	}

	async verifyToken(): Promise<boolean> {
		try {
			await this.apiFetch('/auth/verify', {
				method: 'POST'
			});
			return true;
		} catch {
			this.clearToken();
			return false;
		}
	}

	async listFiles(): Promise<R2File[]> {
		const response = await this.apiFetch('/files/list');
		const data = await response.json();
		return data.files as R2File[];
	}

	async getFileContent(key: string): Promise<R2FileContent> {
		const response = await this.apiFetch(`/files/get?key=${encodeURIComponent(key)}`);
		const etag = response.headers.get('X-R2-Etag') || '';
		const data = await response.arrayBuffer();
		return { data, etag };
	}

	async uploadFile(key: string, data: ArrayBuffer, ifMatch?: string): Promise<{ etag: string }> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/octet-stream',
			'X-R2-Key': key
		};
		if (ifMatch) {
			headers['If-Match'] = ifMatch;
		}

		const response = await this.apiFetch('/files/put', {
			method: 'PUT',
			headers,
			body: new Blob([data], { type: 'application/octet-stream' })
		});

		const result = await response.json();
		return { etag: result.etag };
	}

	async deleteFile(key: string): Promise<void> {
		await this.apiFetch(`/files/delete?key=${encodeURIComponent(key)}`, {
			method: 'DELETE'
		});
	}

	async checkConflict(key: string, localEtag: string): Promise<ConflictInfo | null> {
		const response = await this.apiFetch(`/files/get?key=${encodeURIComponent(key)}`);
		const remoteEtag = response.headers.get('X-R2-Etag') || '';

		if (!localEtag || !remoteEtag || localEtag === remoteEtag) {
			return null;
		}

		const contentLength = response.headers.get('Content-Length') || '0';
		const lastModified = response.headers.get('X-R2-LastModified') || new Date().toISOString();

		return {
			remoteEtag,
			localEtag,
			remoteSize: parseInt(contentLength, 10),
			remoteLastModified: lastModified
		};
	}
}

export const r2Client = new R2Client();

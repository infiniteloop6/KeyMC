import { r2Client } from '$lib/r2/r2-client';
import { dbStore } from './database.svelte';
import { uiStore } from './ui.svelte';

class AuthStore {
	isAuthenticated = $state(false);
	isLoading = $state(false);

	constructor() {
		setTimeout(() => this.restoreSession(), 100);
	}

	private async restoreSession(): Promise<void> {
		if (!r2Client.isAuthenticated) return;

		try {
			const valid = await r2Client.verifyToken();
			if (valid) {
				this.isAuthenticated = true;
			} else {
				this.isAuthenticated = false;
				r2Client.clearToken();
			}
		} catch {
			this.isAuthenticated = false;
			r2Client.clearToken();
		}
	}

	async login(token: string): Promise<void> {
		this.isLoading = true;
		try {
			r2Client.setToken(token);
			const valid = await r2Client.verifyToken();
			if (!valid) {
				r2Client.clearToken();
				this.isAuthenticated = false;
				throw new Error('访问令牌无效');
			}
			this.isAuthenticated = true;
			uiStore.addToast('已成功连接', 'success');
		} catch (e) {
			r2Client.clearToken();
			this.isAuthenticated = false;
			const message = e instanceof Error ? e.message : '连接失败';
			uiStore.addToast(message, 'error');
			throw e;
		} finally {
			this.isLoading = false;
		}
	}

	logout(): void {
		dbStore.lock();
		r2Client.clearToken();
		this.isAuthenticated = false;
		uiStore.addToast('已退出', 'info');
	}
}

export const authStore = new AuthStore();

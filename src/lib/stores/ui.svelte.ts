class UiStore {
	toasts = $state<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
	editingEntry = $state(false);
	creatingEntry = $state(false);

	private nextId = 0;

	addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
		const id = String(this.nextId++);
		this.toasts.push({ id, message, type });
		setTimeout(() => {
			this.toasts = this.toasts.filter((t) => t.id !== id);
		}, 3000);
	}

	removeToast(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

export const uiStore = new UiStore();

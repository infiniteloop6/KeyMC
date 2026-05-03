let initialized = false;

export async function initArgon2(): Promise<void> {
	if (initialized) return;

	const kdbxweb = await import('kdbxweb');

	(window as any).argon2WasmPath = '/dist/argon2.wasm';

	const argon2 = (window as any).argon2;
	if (!argon2 || typeof argon2.hash !== 'function') {
		throw new Error('argon2 not loaded');
	}

	kdbxweb.CryptoEngine.setArgon2Impl(
		(password: ArrayBuffer, salt: ArrayBuffer, memory: number, iterations: number, length: number, parallelism: number, type: number, version: number) => {
			return argon2.hash({
				pass: new Uint8Array(password),
				salt: new Uint8Array(salt),
				time: iterations,
				mem: memory,
				hashLen: length,
				parallelism,
				type,
				version
			}).then((result: { hash: Uint8Array }) => {
				return result.hash.buffer as ArrayBuffer;
			});
		}
	);

	initialized = true;
}

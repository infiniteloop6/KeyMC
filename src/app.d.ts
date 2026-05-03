declare global {
	namespace App {
		interface Platform {
			env: {
				R2_BUCKET: R2Bucket;
				ACCESS_TOKEN: string;
			};
		}
	}
}

declare module 'argon2-browser' {
	interface Argon2Result {
		hash: Uint8Array;
		hashHex: string;
		encoded: string;
	}

	interface Argon2Options {
		pass: Uint8Array | string;
		salt: Uint8Array | string;
		time?: number;
		mem?: number;
		hashLen?: number;
		parallelism?: number;
		type?: number;
		version?: number;
	}

	export function hash(options: Argon2Options): Promise<Argon2Result>;
	export function verify(options: { pass: Uint8Array | string; encoded: string; type?: number }): Promise<void>;
}

export {};

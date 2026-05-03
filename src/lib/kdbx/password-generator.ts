const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

export interface PasswordOptions {
	length: number;
	uppercase: boolean;
	lowercase: boolean;
	digits: boolean;
	symbols: boolean;
}

export const defaultOptions: PasswordOptions = {
	length: 20,
	uppercase: true,
	lowercase: true,
	digits: true,
	symbols: true
};

export function generatePassword(options: PasswordOptions = defaultOptions): string {
	let chars = '';
	if (options.lowercase) chars += LOWERCASE;
	if (options.uppercase) chars += UPPERCASE;
	if (options.digits) chars += DIGITS;
	if (options.symbols) chars += SYMBOLS;

	if (!chars) chars = LOWERCASE + UPPERCASE + DIGITS;

	const array = new Uint32Array(options.length);
	crypto.getRandomValues(array);

	return Array.from(array, (v) => chars[v % chars.length]).join('');
}

export function estimateStrength(password: string): { score: number; label: string; color: string } {
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (password.length >= 16) score++;
	if (password.length >= 20) score++;
	if (/[a-z]/.test(password)) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^a-zA-Z0-9]/.test(password)) score++;

	if (score <= 2) return { score, label: '弱', color: 'text-danger' };
	if (score <= 4) return { score, label: '一般', color: 'text-warning' };
	if (score <= 6) return { score, label: '强', color: 'text-success' };
	return { score, label: '非常强', color: 'text-success' };
}

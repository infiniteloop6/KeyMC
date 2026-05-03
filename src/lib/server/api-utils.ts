import type { RequestEvent } from '@sveltejs/kit';

export function verifyAuth(event: RequestEvent): boolean {
	const token = event.request.headers.get('Authorization')?.replace('Bearer ', '');
	const expected = event.platform?.env?.ACCESS_TOKEN;
	if (!expected) {
		console.error('ACCESS_TOKEN not configured');
		return false;
	}
	return token === expected;
}

export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers
		}
	});
}

export function errorResponse(error: string, status = 400): Response {
	return jsonResponse({ error }, status);
}

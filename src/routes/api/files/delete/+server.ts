import type { RequestHandler } from './$types';
import { verifyAuth, jsonResponse, errorResponse } from '$lib/server/api-utils';

export const DELETE: RequestHandler = async (event) => {
	if (!verifyAuth(event)) {
		return errorResponse('Unauthorized', 401);
	}

	const bucket = event.platform?.env?.R2_BUCKET;
	if (!bucket) {
		return errorResponse('R2 bucket not configured', 500);
	}

	const key = event.url.searchParams.get('key');
	if (!key) {
		return errorResponse('Missing key parameter', 400);
	}

	const existing = await bucket.head(key);
	if (!existing) {
		return errorResponse('File not found', 404);
	}

	await bucket.delete(key);

	return jsonResponse({ success: true });
};

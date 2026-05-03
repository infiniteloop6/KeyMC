import type { RequestHandler } from './$types';
import { verifyAuth, errorResponse } from '$lib/server/api-utils';

export const GET: RequestHandler = async (event) => {
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

	const object = await bucket.get(key);
	if (!object) {
		return errorResponse('File not found', 404);
	}

	const data = await object.arrayBuffer();

	return new Response(data, {
		status: 200,
		headers: {
			'Content-Type': 'application/octet-stream',
			'X-R2-Etag': object.etag || '',
			'X-R2-LastModified': object.uploaded?.toISOString() || '',
			'Cache-Control': 'no-store'
		}
	});
};

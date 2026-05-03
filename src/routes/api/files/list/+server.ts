import type { RequestHandler } from './$types';
import { verifyAuth, jsonResponse, errorResponse } from '$lib/server/api-utils';

export const GET: RequestHandler = async (event) => {
	if (!verifyAuth(event)) {
		return errorResponse('Unauthorized', 401);
	}

	const bucket = event.platform?.env?.R2_BUCKET;
	if (!bucket) {
		return errorResponse('R2 bucket not configured', 500);
	}

	const listed = await bucket.list();

	const files = listed.objects
		.filter((obj: typeof listed.objects[number]) => obj.key.endsWith('.kdbx'))
		.map((obj: typeof listed.objects[number]) => ({
			key: obj.key,
			size: obj.size,
			lastModified: obj.uploaded.toISOString(),
			etag: obj.etag
		}));

	return jsonResponse({ files });
};

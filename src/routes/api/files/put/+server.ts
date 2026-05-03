import type { RequestHandler } from './$types';
import { verifyAuth, jsonResponse, errorResponse } from '$lib/server/api-utils';

export const PUT: RequestHandler = async (event) => {
	if (!verifyAuth(event)) {
		return errorResponse('Unauthorized', 401);
	}

	const bucket = event.platform?.env?.R2_BUCKET;
	if (!bucket) {
		return errorResponse('R2 bucket not configured', 500);
	}

	const key = event.request.headers.get('X-R2-Key');
	if (!key) {
		return errorResponse('Missing X-R2-Key header', 400);
	}

	const ifMatch = event.request.headers.get('If-Match');

	const data = await event.request.arrayBuffer();

	if (ifMatch) {
		const existing = await bucket.get(key);
		if (existing && existing.etag !== ifMatch) {
			return jsonResponse(
				{
					error: 'CONFLICT',
					message: '远程文件已被修改，请先同步最新版本',
					remoteEtag: existing.etag,
					remoteLastModified: existing.uploaded?.toISOString() || ''
				},
				409
			);
		}
	}

	await bucket.put(key, data);

	const updated = await bucket.get(key);

	return jsonResponse({
		success: true,
		etag: updated?.etag || ''
	});
};

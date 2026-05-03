import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyAuth, jsonResponse } from '$lib/server/api-utils';

export const POST: RequestHandler = async (event) => {
	if (!verifyAuth(event)) {
		return jsonResponse({ error: 'Unauthorized' }, 401);
	}

	return jsonResponse({ valid: true });
};

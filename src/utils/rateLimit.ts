import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
	interval: number; // Time window in milliseconds
	uniqueTokenPerInterval: number; // Max number of unique tokens per interval
}

interface RateLimitInfo {
	lastReset: number;
	tokens: number;
}

export function rateLimit(options: RateLimitOptions) {
	const tokenCache = new LRUCache<string, RateLimitInfo>({
		max: options.uniqueTokenPerInterval,
		ttl: options.interval,
	});

	return {
		check: async (request: NextRequest, limit: number, identifier: string) => {
			const forwarded = request.headers.get('x-forwarded-for');
			const ip = forwarded
				? forwarded.split(',')[0].trim()
				: request.headers.get('x-real-ip') ?? '127.0.0.1';
			const tokenKey = `${identifier}_${ip}`;
			const now = Date.now();

			let rateLimitInfo = tokenCache.get(tokenKey);

			if (!rateLimitInfo) {
				rateLimitInfo = {
					lastReset: now,
					tokens: limit,
				};
			}

			const timePassed = now - rateLimitInfo.lastReset;
			if (timePassed >= options.interval) {
				rateLimitInfo.tokens = limit;
				rateLimitInfo.lastReset = now;
			}

			if (rateLimitInfo.tokens <= 0) {
				const error = new Error('Rate limit exceeded');
				(error as any).code = 'rate_limit_exceeded';
				throw error;
			}

			rateLimitInfo.tokens -= 1;
			tokenCache.set(tokenKey, rateLimitInfo);

			return true;
		},
	};
}

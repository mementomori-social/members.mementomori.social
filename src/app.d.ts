// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- wrangler-generated ambient types
/// <reference path="../worker-configuration.d.ts" />
import type { User, Session } from 'better-auth';
import { createAuth } from '$lib/server/auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	const __COMMIT__: string;
	const __VERSION__: string;

	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		interface Locals {
			user?: User;
			session?: Session;
			auth: ReturnType<typeof createAuth>;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};

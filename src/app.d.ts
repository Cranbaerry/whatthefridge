// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

import { SupabaseClient, Session } from '@supabase/supabase-js'
import { Database } from './DatabaseDefinitions'
import type { Database } from './DatabaseDefinitions';

declare global {
	declare namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
			dbType: Database;
		}
		interface PageData {
			session: Session | null;
		}
		interface Recipe {
			recipeName: null;
		}
		// interface Locals {}
		// interface PageData {}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
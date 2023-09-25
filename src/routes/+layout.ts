// // src/routes/+layout.ts
// import type { LayoutLoad } from './$types';
// import type { Database } from '$lib/DatabaseDefinitions';

// export const load: LayoutLoad = async ({ fetch, data, depends }) => {

//   const supabase = createSupabaseLoadClient<Database>({
//     supabaseUrl: PUBLIC_SUPABASE_URL,
//     supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
//     event: { fetch },
//     serverSession: data.session,
//   })

//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   return { supabase, session }
// }
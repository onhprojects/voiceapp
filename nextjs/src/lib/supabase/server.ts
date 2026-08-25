import {createServerClient} from '@supabase/ssr'
import {cookies} from 'next/headers'
import {ClientType, SassClient} from "@/lib/supabase/unified";
import {Database} from "@/lib/types";

export async function createSSRClient() {
    const cookieStore = await cookies()

    return createServerClient<Database, "public">(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            }
        }
    )
}



export async function createSSRSassClient() {
    const client = await createSSRClient();
    // This must be some bug that SupabaseClient is not properly recognized, so must be ignored
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new SassClient(client as any, ClientType.SERVER);
}

/**
 * Creates a Supabase server client that does NOT read or write cookies.
 *
 * This is safe to use inside cached scopes (e.g. `unstable_cache`) where
 * dynamic data sources like `cookies()` are not allowed. It uses the anon key,
 * so it can only access data that RLS exposes to anonymous users — which is
 * exactly what public, cacheable lookups (like admin settings) need.
 */
export async function createSSRClientNoCookies() {
    return createServerClient<Database, "public">(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return []
                },
                setAll() {
                    // No-op: this client never persists sessions.
                },
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    )
}
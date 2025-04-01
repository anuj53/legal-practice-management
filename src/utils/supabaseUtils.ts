
/**
 * Helper function for type casting Supabase query results
 * This helps avoid TypeScript errors when working with tables that TypeScript
 * doesn't recognize in the schema
 */
export function castQueryResult<T>(result: any): T {
  return result as T;
}

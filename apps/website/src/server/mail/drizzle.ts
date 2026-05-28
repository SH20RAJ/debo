// Re-export the drizzle-orm SQL builders that mail routes use.
// Centralizing the import avoids each route re-discovering the package path.
export {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
} from "drizzle-orm";

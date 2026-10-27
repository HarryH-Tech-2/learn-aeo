// Badge rows in the database are keyed by name. When a badge is renamed or dropped, the old row
// lingers after an upsert-only seed; these are the names the seed should delete.

export function staleBadgeNames(existing: string[], definitions: readonly { name: string }[]): string[] {
  const current = new Set(definitions.map((d) => d.name));
  return existing.filter((name) => !current.has(name));
}

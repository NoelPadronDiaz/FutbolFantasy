export type SortDirection = 'asc' | 'desc';

export function compareValues(
  a: string | number | undefined,
  b: string | number | undefined,
  dir: SortDirection,
): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  if (a === b) return 0;
  const cmp = a < b ? -1 : 1;
  return dir === 'asc' ? cmp : -cmp;
}

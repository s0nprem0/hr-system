export function isValidMongoId(id: string | undefined | null): boolean {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

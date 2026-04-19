/**
 * Generates two-letter initials for a given name.
 * - Handles complex scholarly names by taking the first letter of the first word
 *   and the first letter of the last significant word.
 * - Always returns exactly two characters for visual consistency.
 */
export function getInitials(name: any): string {
  if (!name || typeof name !== 'string') return 'AC';
  
  const trimmed = name.trim();
  if (!trimmed) return 'AC';
  
  const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
  
  if (parts.length >= 2) {
    // Take first letter of first word and first letter of last word
    const firstChar = parts[0].charAt(0).toUpperCase();
    const lastChar = parts[parts.length - 1].charAt(0).toUpperCase();
    return firstChar + lastChar;
  }
  
  // Single word: take first two letters
  if (trimmed.length >= 2) {
    return trimmed.substring(0, 2).toUpperCase();
  }
  
  // Single character: repeat it
  return (trimmed + trimmed).toUpperCase();
}

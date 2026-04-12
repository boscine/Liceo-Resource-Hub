
// src/lib/moderation.ts

/**
 * A basic collection of inappropriate words for scholarly environment moderation.
 * In a production environment, this should be expanded or integrated with a dedicated API.
 */
const FORBIDDEN_WORDS = [
  // Common Profanity (English)
  'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy',
  // Common Profanity (Filipino)
  'putang', 'gago', 'tarantado', 'bobo', 'pakshet', 'ulol', 'leche', 'puta',
  // Scholarly misconduct keywords
  'hack', 'cheat', 'plagiarize', 'scam'
];

/**
 * Checks if a string contains any inappropriate content based on the forbidden list.
 * @param text The string to validate
 * @returns boolean True if inappropriate content is found
 */
export function containsInappropriateContent(text: string): boolean {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for exact matches and common variations using regex
  return FORBIDDEN_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
    return regex.test(normalizedText);
  });
}

/**
 * Redacts inappropriate words from a string.
 * @param text The string to clean
 * @returns string The cleaned string
 */
export function filterContent(text: string): string {
  if (!text) return '';
  
  let cleanedText = text;
  FORBIDDEN_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, '***');
  });
  
  return cleanedText;
}

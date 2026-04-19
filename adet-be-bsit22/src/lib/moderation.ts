
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
  'hack', 'cheat', 'plagiarize', 'scam',
  // Hate Speech & Historical Atrocities
  'hitler', 'nazi', 'kkk', 'nigger', 'faggot', 'retard'
];

/**
 * Checks if a string contains any inappropriate content based on the forbidden list.
 * This version uses a more robust regex to catch common bypasses (spacing, punctuation).
 * @param text The string to validate
 * @returns boolean True if inappropriate content is found
 */
export function containsInappropriateContent(text: string): boolean {
  if (!text) return false;
  
  // Normalize: remove common punctuation and extra spacing for better detection
  const normalizedText = text.toLowerCase().replace(/[.\-_ ]/g, '');
  
  return FORBIDDEN_WORDS.some(word => {
    // Check if the normalized word exists in the normalized text
    return normalizedText.includes(word.toLowerCase());
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
    // Catch common bypasses in replacement too
    const pattern = word.split('').join('[.\\-_ ]*');
    const regex = new RegExp(pattern, 'gi');
    cleanedText = cleanedText.replace(regex, '***');
  });
  
  return cleanedText;
}

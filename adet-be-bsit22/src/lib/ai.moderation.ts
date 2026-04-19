import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Uses Gemini AI to analyze if the post content is appropriate for the Liceo Resource Hub.
 * Returns { isAppropriate: boolean, reason?: string }
 */
export async function analyzePostContent(title: string, description: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("AI Moderation skipped: GEMINI_API_KEY not configured.");
    return { isAppropriate: true };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      As an Academic Curator for the Liceo Resource Hub, evaluate the following student request for institutional appropriateness.
      The hub is for sharing academic resources (textbooks, uniforms, tools, etc.).
      
      POST TITLE: "${title}"
      POST DESCRIPTION: "${description}"

      CRITERIA:
      1. No profanity or unprofessional language.
      2. Must be related to academic life or student needs (not dating, illegal items, or spam).
      3. No harassment or hate speech.

      Respond ONLY with a JSON object:
      {
        "isAppropriate": boolean,
        "reason": "Short explanation if inappropriate, otherwise empty"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown code blocks from response
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Moderation Error:", error);
    // Fail-safe: if AI fails, allow but maybe flag for human review later
    return { isAppropriate: true }; 
  }
}


import { GoogleGenAI, Type } from "@google/genai";

export interface AnalyzedBookData {
    title: string;
    author: string;
    year: number;
    description: string;
    tags: string[];
}

// This schema guides the AI to return data in the desired format.
const schema = {
  type: Type.OBJECT,
  properties: {
    title: { 
        type: Type.STRING, 
        description: "The full title of the document. Infer it from the text if not explicitly stated." 
    },
    author: { 
        type: Type.STRING, 
        description: "The author of the document. Use 'Unknown' if no author can be found." 
    },
    year: { 
        type: Type.INTEGER, 
        description: "The year the document was written or published as a number. Provide a reasonable estimate if not specified (e.g., 350 for 350 AD, -300 for 300 BC)." 
    },
    description: { 
        type: Type.STRING, 
        description: "A concise, one-paragraph summary of the document's esoteric content, themes, and purpose." 
    },
    tags: {
      type: Type.ARRAY,
      description: "Up to 5 relevant esoteric tags that categorize the text. Choose from: Hermeticism, Metaphysics, Alchemy, Gnosticism, Philosophy, Occult, Symbolism, Tarot, Thelema, Magic, Renaissance, Kabbalah, Mysticism, Judaism, Coptic, Psychology, Astrology, Christian Hermeticism, Rosicrucianism. If none of these apply, you can create new, relevant tags.",
      items: { type: Type.STRING }
    }
  },
  required: ["title", "author", "year", "description", "tags"]
};

/**
 * Analyzes a given text using the Gemini API to extract structured data about it.
 * @param textContent The raw text content of the manuscript to analyze.
 * @returns A promise that resolves to the structured book data.
 * @throws An error if the API key is missing, or if the API call fails.
 */
export async function analyzeText(textContent: string): Promise<AnalyzedBookData> {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        // This is a user-facing error, as it's a configuration issue they can't fix.
        throw new Error('Configuration Error: The AI Scribe is not properly configured. Please contact the administrator.');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // The system instruction provides context and the primary goal to the AI model.
    const systemInstruction = `You are an expert librarian AI for the "Arcane Archives," a digital library of esoteric and occult texts. Your task is to analyze a provided manuscript text and extract key metadata. Based on the text, you must infer or identify the title, author, year of publication, provide a concise summary, and generate relevant tags. You must return this information in the specified JSON format.`;
    
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            // Separate the high-level instruction from the user-provided data for better results.
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
            // The content is now just the raw text to be analyzed.
            // We truncate to a reasonable length to avoid excessively large payloads.
            contents: textContent.substring(0, 30000),
        });
        
        // The Gemini API returns a JSON string in the `text` property when a schema is used.
        const jsonString = result.text.trim();
        if (!jsonString) {
            throw new Error("The AI Scribe returned an empty response. The manuscript might be too short or lack discernible content.");
        }

        const data = JSON.parse(jsonString);

        return data as AnalyzedBookData;

    } catch (error) {
        console.error("Gemini API Error:", error);
        
        // Improve error classification for better user feedback.
        if (error.message.includes('candidate')) {
            // This often indicates a safety block or other content-related issue.
            return Promise.reject(new Error('The AI Scribe refused to process the manuscript. It may contain sensitive content or violate safety policies.'));
        }
        if (error instanceof SyntaxError) {
             return Promise.reject(new Error('The AI Scribe provided a malformed response. Please try again.'));
        }

        // Generic fallback error for network issues or other API problems.
        throw new Error('The AI Scribe failed to interpret the manuscript. An unexpected error occurred.');
    }
}

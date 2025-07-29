import type { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

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
 * A serverless function that securely calls the Gemini API to analyze manuscript text.
 */
const handler: Handler = async (event) => {
  // 1. Check for API Key configuration on the server
  if (!process.env.API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Configuration Error: The AI Scribe is not properly configured on the server.' }),
    };
  }

  // 2. Ensure it's a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }
  
  try {
    // 3. Parse the incoming text content
    const body = JSON.parse(event.body || '{}');
    const { textContent } = body;

    if (!textContent || typeof textContent !== 'string' || textContent.trim().length === 0) {
      return {
        statusCode: 400, // Bad Request
        body: JSON.stringify({ message: 'Bad Request: textContent is required in the request body.' }),
      };
    }

    // 4. Call the Gemini API
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `You are an expert librarian AI for the "Arcane Archives," a digital library of esoteric and occult texts. Your task is to analyze a provided manuscript text and extract key metadata. Based on the text, you must infer or identify the title, author, year of publication, provide a concise summary, and generate relevant tags. You must return this information in the specified JSON format.`;
    
    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
        },
        contents: textContent.substring(0, 30000), // Truncate content for safety
    });

    const jsonString = result.text.trim();
    if (!jsonString) {
      return {
          statusCode: 500,
          body: JSON.stringify({ message: "The AI Scribe returned an empty response. The manuscript might be too short or lack discernible content." }),
      };
    }
    
    // The Gemini API response is already a JSON string because of the schema
    const data = JSON.parse(jsonString);

    // 5. Return the successful response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Gemini Function Error:", error);

    if (error.message.includes('candidate')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'The AI Scribe refused to process the manuscript. It may contain sensitive content or violate safety policies.' }),
      };
    }
    if (error instanceof SyntaxError) {
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'The AI Scribe provided a malformed response. Please try again.' }),
       };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'The AI Scribe failed to interpret the manuscript. An unexpected error occurred.' }),
    };
  }
};

export { handler };

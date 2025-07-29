
export interface AnalyzedBookData {
    title: string;
    author: string;
    year: number;
    description: string;
    tags: string[];
}

/**
 * Analyzes a given text by calling our secure Netlify Function, which in turn calls the Gemini API.
 * @param textContent The raw text content of the manuscript to analyze.
 * @returns A promise that resolves to the structured book data.
 * @throws An error if the serverless function call fails.
 */
export async function analyzeText(textContent: string): Promise<AnalyzedBookData> {
    const endpoint = '/.netlify/functions/analyze-manuscript';
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ textContent }),
        });

        const responseBody = await response.json();

        if (!response.ok) {
            // Use the error message from the function's response if available
            throw new Error(responseBody.message || 'The AI Scribe failed to respond correctly.');
        }

        return responseBody as AnalyzedBookData;

    } catch (error) {
        console.error("Error calling analyze-manuscript function:", error);
        // Re-throw the error, which might be the one from the server or a generic one for network issues.
        throw new Error(error instanceof Error ? error.message : 'Failed to communicate with the AI Scribe. Please check your network connection.');
    }
}

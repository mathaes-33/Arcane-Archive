import type { Handler } from "@netlify/functions";

/**
 * A serverless function that checks for the presence of the API_KEY
 * in the server-side environment variables and reports its status to the client.
 */
const handler: Handler = async () => {
  const isConfigured = !!process.env.API_KEY;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache', // Ensure the client always gets the latest status
    },
    body: JSON.stringify({ isConfigured }),
  };
};

export { handler };

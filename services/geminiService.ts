import { GoogleGenAI } from "@google/genai";

// Lazily initialize the AI client to avoid crashing the app on start if the API key is missing.
let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (ai) {
    return ai;
  }
  
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    // This error will be caught by the calling function and shown to the user.
    throw new Error("AI service is not configured: API_KEY is missing.");
  }
  
  ai = new GoogleGenAI({ apiKey: API_KEY });
  return ai;
}


export async function generatePolicyContent(policyName: string): Promise<string> {
  try {
    const client = getAiClient();

    const prompt = `You are an expert in IT security and compliance. Write a comprehensive IT policy about "${policyName}".
The policy should be well-structured and ready for a corporate environment.
Use Markdown for formatting. Include the following sections:
1.  **Overview**: A brief introduction.
2.  **Purpose**: The goal of the policy.
3.  **Scope**: Who this policy applies to.
4.  **Policy**: The main rules and guidelines, using sub-sections if necessary.
5.  **Policy Compliance**: How compliance is measured and what happens in case of non-compliance.
6.  **Related Standards, Policies and Processes**: A list of related documents.
7.  **Definitions and Terms**: A list of key terms.
8.  **Revision History**: A table for tracking changes.

Start the document with a level 3 markdown heading like this: '### Consensus Policy Resource Community' and include a disclaimer about free use for the internet community from the SANS institute.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text ?? '';
  } catch (error) {
    console.error("Error generating policy content:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
         throw new Error("The AI service is not configured. Please contact the administrator to set the API key.");
    }
    throw new Error("Failed to generate content from AI. Please check the server configuration and try again.");
  }
}
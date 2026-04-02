import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeNews(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following news headline or article for credibility. 
    Determine if it is "Real" or "Fake". 
    Provide a confidence percentage (0-100) and a brief explanation.
    
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          label: {
            type: Type.STRING,
            enum: ["Real", "Fake"],
            description: "The credibility label",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence percentage from 0 to 100",
          },
          explanation: {
            type: Type.STRING,
            description: "Brief reasoning for the prediction",
          },
        },
        required: ["label", "confidence", "explanation"],
      },
    },
  });

  return JSON.parse(response.text);
}

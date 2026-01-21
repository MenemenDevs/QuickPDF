
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiProcessedData } from "../types";

const API_KEY = process.env.API_KEY || '';

export const processDocument = async (base64Image: string): Promise<GeminiProcessedData> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Identify this document. Provide a professional title for it and extract the key text via OCR. Return the result in JSON format.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'A suggested professional filename' },
          ocrContent: { type: Type.STRING, description: 'The full text content of the document' },
          qualityScore: { type: Type.NUMBER, description: 'Estimated scan quality from 0 to 1' }
        },
        required: ['title', 'ocrContent', 'qualityScore'],
      },
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as GeminiProcessedData;
};

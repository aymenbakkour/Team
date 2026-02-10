
import { GoogleGenAI, Type } from "@google/genai";
import { MeetingSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMeetingTranscript = async (transcript: string): Promise<MeetingSummary> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following meeting transcript and extract strategic insights.
    Transcript: ${transcript}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          date: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          sentiment: { 
            type: Type.STRING,
            description: "One of: Positive, Neutral, Critical"
          },
          actionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                owner: { type: Type.STRING },
                priority: { type: Type.STRING },
                deadline: { type: Type.STRING }
              }
            }
          }
        },
        required: ["topic", "date", "keyPoints", "sentiment", "actionItems"]
      }
    }
  });

  const rawJson = response.text || '{}';
  const data = JSON.parse(rawJson.trim());
  
  // Add IDs and initial status
  return {
    ...data,
    actionItems: data.actionItems.map((item: any, index: number) => ({
      ...item,
      id: `task-${Date.now()}-${index}`,
      status: 'Pending'
    }))
  };
};

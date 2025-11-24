import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// IMPORTANT: The API key is injected via process.env.API_KEY as per system instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_THINKING = 'gemini-3-pro-preview';

export const generateCourseMetadata = async (content: string, type: 'text' | 'image') => {
  const prompt = `
    You are an expert educational content analyzer. 
    Analyze the following content (which may be raw text or OCR output).
    Provide a JSON response with the following structure:
    {
      "title": "A concise, academic title for this content",
      "description": "A 2-sentence summary suitable for a course card",
      "summary": "A comprehensive 2-paragraph summary of the material",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
      "objectives": ["Learning objective 1", "Learning objective 2", "Learning objective 3"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [
        { role: 'user', parts: [{ text: prompt }, { text: content.substring(0, 30000) }] } // Limit context for demo speed
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            objectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Metadata Error:", error);
    return {
      title: "Untitled Course",
      description: "Could not analyze content.",
      summary: "Analysis failed. Please try again.",
      keyPoints: [],
      objectives: []
    };
  }
};

export const generateQuiz = async (content: string) => {
  const prompt = `
    Based on the following content, generate 3 multiple-choice questions to test understanding.
    Return a JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [
        { role: 'user', parts: [{ text: prompt }, { text: content.substring(0, 20000) }] }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};

export const generateStudyPlan = async (content: string) => {
  const prompt = `
    Create a detailed 3-day study plan based on the provided content.
    For each day, provide a focus topic and a list of specific activities or concepts to review.
    Ensure the plan is structured and actionable.
    
    Format the output as a JSON object with a 'days' array, where each day has 'day', 'topic', and 'activities' (array of strings).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_THINKING, // Using 3.0 Pro for complex reasoning
      contents: [
        { role: 'user', parts: [{ text: prompt }, { text: content.substring(0, 30000) }] }
      ],
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Enable thinking for better planning
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  activities: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{"days": []}');
  } catch (error) {
    console.error("Gemini Study Plan Error:", error);
    return { days: [] };
  }
};

export const chatWithDocument = async (
  history: {role: string, parts: {text: string}[]}[], 
  newMessage: string, 
  context: string,
  systemInstruction?: string
) => {
  try {
    // Default instruction if none provided
    const instruction = systemInstruction || "You are a helpful teaching assistant. Use the provided context to answer student questions.";

    const chat = ai.chats.create({
      model: MODEL_TEXT,
      config: {
        systemInstruction: instruction
      },
      history: [
        {
          role: 'user',
          parts: [{ text: `Here is the context for our discussion:\n\n${context.substring(0, 25000)}` }]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I am ready to help you learn from this document based on your preferred teaching style." }]
        },
        ...history
      ]
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the knowledge base right now.";
  }
};

export const chatGeneral = async (
  history: {
    role: string, 
    parts: ({text?: string, inlineData?: {mimeType: string, data: string}})[]
  }[], 
  message: string | ({text?: string, inlineData?: {mimeType: string, data: string}})[],
  systemInstructionOverride?: string
) => {
  try {
    const defaultInstruction = `
    You are 'Lumina AI', an OER (Open Educational Resources) Content Generator and smart educational companion.
    
    Your operational rules:
    1. **Source Selection**: Prioritize open-licensed Arabic sources (e.g., OERx.nelc.gov.sa, ALECSO OER, BUiD Library).
    2. **Attribution**: ALWAYS provide clear attribution in Arabic (e.g., "المصدر: المنصة الوطنية OERx (رخصة CC ...)").
    3. **Structure**: When explaining a topic, structure it as a learning module: Title, Objectives, Summary, Key Points, Examples, Exercises, Quiz.
    4. **Language**: If the user asks in Arabic, respond in Arabic using the OER sources. If the user asks in English but the topic has good Arabic OER, mention it.
    5. **Fallback**: If no Arabic OER is found, look for English OER (MIT OCW, OER Commons) and ask permission to translate/use.
    6. **Tools**: You have access to Google Search to find OER materials.
    `;

    const chat = ai.chats.create({
      model: MODEL_THINKING, // Using 3.0 Pro for better general chat & search
      config: {
        systemInstruction: systemInstructionOverride || defaultInstruction,
        tools: [{googleSearch: {}}]
      },
      history: history as any 
    });

    // Handle multimodal message
    const result = await chat.sendMessage({ message: message as any });
    
    // Extract grounding metadata if available (for Google Search sources)
    let text = result.text;
    if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
       const chunks = result.candidates[0].groundingMetadata.groundingChunks;
       const links = chunks
        .map((c: any) => c.web?.uri ? `[${c.web.title}](${c.web.uri})` : null)
        .filter(Boolean)
        .join('\n');
       if (links) {
         text += `\n\n**Sources:**\n${links}`;
       }
    }

    return text;
  } catch (error) {
    console.error("Gemini General Chat Error:", error);
    return "I am currently offline or experiencing heavy traffic. Please try again later.";
  }
};
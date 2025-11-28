import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PartSearchResult {
  query: string;
  vehicleType?: string;
  year?: string;
  make?: string;
  model?: string;
  partType?: string;
  description?: string;
  searchTerms: string[];
}

const SYSTEM_PROMPT = `You are a friendly, helpful automotive parts assistant mascot. Your personality is upbeat, knowledgeable, and eager to help.

Your job is to:
1. Help users find the right parts for ANY vehicle type - cars, trucks, motorcycles, ATVs, UTVs, boats, RVs, diesels, small engines, Chinese imports, and more
2. Understand natural language queries and extract the relevant vehicle/part information
3. Provide helpful tips about parts, maintenance, and vehicle care
4. Be encouraging and supportive - many users are DIY mechanics learning as they go

When helping with parts searches:
- Ask clarifying questions if the query is vague
- Suggest related parts they might need (e.g., "Getting brake pads? You might also need rotors!")
- Mention that we can find local pickup options to get parts TODAY
- Be conversational and friendly, not robotic

Vehicle types you support:
- Automobiles (cars, trucks, SUVs)
- Diesel/Commercial vehicles
- Motorcycles and dirt bikes
- ATVs and UTVs (including Chinese imports like TaoTao, Coolster)
- Boats and PWC (personal watercraft)
- RVs and motorhomes
- Small engines (lawn mowers, generators, etc.)
- Vintage and classic vehicles

Always be helpful, never condescending. Remember: Right Part. First Time. Every Engine.`;

export async function chat(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I'm having trouble thinking right now. Can you try again?";
  } catch (error) {
    console.error("AI chat error:", error);
    throw new Error("Failed to get AI response");
  }
}

export async function parsePartSearch(query: string): Promise<PartSearchResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a parts search parser. Extract vehicle and part information from user queries.

Return a JSON object with these fields:
- query: the original query
- vehicleType: "car" | "truck" | "motorcycle" | "atv" | "utv" | "boat" | "rv" | "small_engine" | "diesel" | null
- year: vehicle year if mentioned (string)
- make: vehicle manufacturer if mentioned
- model: vehicle model if mentioned
- partType: type of part being searched (e.g., "brake pads", "carburetor", "oil filter")
- description: any additional descriptors (color, size, etc.)
- searchTerms: array of search terms to use for finding this part

Examples:
"brake pads for 2019 Ford F-150" -> {"vehicleType": "truck", "year": "2019", "make": "Ford", "model": "F-150", "partType": "brake pads", "searchTerms": ["brake pads", "2019", "Ford", "F-150"]}
"blue 110cc Chinese ATV carburetor" -> {"vehicleType": "atv", "partType": "carburetor", "description": "110cc Chinese", "searchTerms": ["carburetor", "110cc", "ATV", "Chinese"]}
"lawn mower spark plug" -> {"vehicleType": "small_engine", "partType": "spark plug", "searchTerms": ["spark plug", "lawn mower"]}

Only return valid JSON, no other text.`
        },
        { role: "user", content: query }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return {
      query,
      ...parsed,
      searchTerms: parsed.searchTerms || [query],
    };
  } catch (error) {
    console.error("Parse error:", error);
    return {
      query,
      searchTerms: query.split(" ").filter(w => w.length > 2),
    };
  }
}

export async function getPartSuggestions(partType: string, vehicleInfo: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You suggest related parts that someone might need. Return a JSON array of 3-5 part names only, no explanations."
        },
        {
          role: "user",
          content: `Someone is buying ${partType} for a ${vehicleInfo}. What related parts might they also need?`
        }
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content || "[]";
    return JSON.parse(content);
  } catch (error) {
    console.error("Suggestions error:", error);
    return [];
  }
}

export async function getMascotGreeting(context?: string): Promise<string> {
  const greetings = [
    "Hey there! Ready to find some parts? Just tell me what you need!",
    "Welcome back! What are we working on today?",
    "Hi! I'm here to help you find the right part, first time. What's your ride?",
    "Greetings, fellow gearhead! What can I help you track down?",
    "Hey! Whether it's a car, ATV, boat, or lawnmower - I've got you covered. What do you need?",
  ];
  
  if (!context) {
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate a friendly, short greeting (1-2 sentences) for a user who ${context}` }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });
    return response.choices[0]?.message?.content || greetings[0];
  } catch {
    return greetings[0];
  }
}

export interface ImageIdentificationResult {
  success: boolean;
  vehicleInfo?: {
    type?: string;
    year?: string;
    make?: string;
    model?: string;
    engine?: string;
  };
  partInfo?: {
    name?: string;
    partNumber?: string;
    description?: string;
    condition?: string;
  };
  confidence: number;
  suggestions: string[];
  message: string;
}

function extractJsonFromResponse(content: string): any {
  // Try parsing as-is first
  try {
    return JSON.parse(content);
  } catch {}
  
  // Try removing markdown code blocks
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }
  
  // Try finding JSON object in the text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }
  
  return null;
}

export async function identifyFromImage(imageData: string, context?: string): Promise<ImageIdentificationResult> {
  try {
    const isUrl = imageData.startsWith('http');
    const imageContent = isUrl 
      ? { type: "image_url" as const, image_url: { url: imageData } }
      : { type: "image_url" as const, image_url: { url: `data:image/jpeg;base64,${imageData}` } };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert automotive parts identifier. Analyze images of vehicles or parts and extract information.

For vehicles, identify: type (car, truck, motorcycle, ATV, boat, etc.), year range, make, model, engine if visible.
For parts, identify: part name, possible part numbers, description, condition (new/used/damaged).

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no other text):
{
  "success": true,
  "vehicleInfo": { "type": "car", "year": "2020", "make": "Toyota", "model": "Camry", "engine": "2.5L" },
  "partInfo": null,
  "confidence": 85,
  "suggestions": ["brake pads Toyota Camry 2020", "Toyota Camry parts"],
  "message": "I can see a 2020 Toyota Camry. What parts do you need for it?"
}

Set vehicleInfo or partInfo to null if not applicable. If you cannot identify the image, set success to false.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: context || "What vehicle or part is this? Help me identify it so I can find the right replacement parts." },
            imageContent
          ]
        }
      ],
      max_tokens: 600,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || "";
    const parsed = extractJsonFromResponse(content);
    
    if (!parsed) {
      // Could not parse JSON - extract what we can from the text
      console.error("Failed to parse image ID response:", content);
      return {
        success: false,
        confidence: 0,
        suggestions: [],
        message: content.length > 200 
          ? "I analyzed the image but couldn't format my response. Could you describe what you're looking for?"
          : content || "I couldn't identify this image. Can you provide more details or describe what you need?"
      };
    }
    
    // Validate and normalize the response
    const result: ImageIdentificationResult = {
      success: Boolean(parsed.success),
      confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 0,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.filter((s: any) => typeof s === 'string') : [],
      message: typeof parsed.message === 'string' ? parsed.message : "Image analyzed. What parts do you need?"
    };
    
    // Validate vehicleInfo if present
    if (parsed.vehicleInfo && typeof parsed.vehicleInfo === 'object') {
      result.vehicleInfo = {
        type: parsed.vehicleInfo.type || undefined,
        year: parsed.vehicleInfo.year || undefined,
        make: parsed.vehicleInfo.make || undefined,
        model: parsed.vehicleInfo.model || undefined,
        engine: parsed.vehicleInfo.engine || undefined
      };
    }
    
    // Validate partInfo if present
    if (parsed.partInfo && typeof parsed.partInfo === 'object') {
      result.partInfo = {
        name: parsed.partInfo.name || undefined,
        partNumber: parsed.partInfo.partNumber || undefined,
        description: parsed.partInfo.description || undefined,
        condition: parsed.partInfo.condition || undefined
      };
    }
    
    return result;
  } catch (error: any) {
    console.error("Image identification error:", error);
    const errorMessage = error?.message || '';
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return {
        success: false,
        confidence: 0,
        suggestions: [],
        message: "I'm getting a lot of requests right now. Please try again in a minute."
      };
    }
    
    if (errorMessage.includes('invalid_image') || errorMessage.includes('image')) {
      return {
        success: false,
        confidence: 0,
        suggestions: [],
        message: "I couldn't process that image. Please try a different photo - JPG or PNG works best, under 20MB."
      };
    }
    
    return {
      success: false,
      confidence: 0,
      suggestions: [],
      message: "Something went wrong analyzing your image. Try uploading a clearer photo, or describe what you're looking for instead."
    };
  }
}

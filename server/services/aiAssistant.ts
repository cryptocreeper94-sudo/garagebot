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

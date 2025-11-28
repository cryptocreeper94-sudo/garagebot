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

export interface VehicleContext {
  id?: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  mileage?: number;
  lastService?: string;
  nickname?: string;
}

export interface UserContext {
  userId?: string;
  username?: string;
  isPro?: boolean;
  vehicles?: VehicleContext[];
  selectedVehicle?: VehicleContext;
  recentSearches?: string[];
  location?: string;
}

// In-memory conversation store (would be Redis/DB in production)
const conversationStore = new Map<string, ChatMessage[]>();

export function getConversationHistory(sessionId: string): ChatMessage[] {
  return conversationStore.get(sessionId) || [];
}

export function addToConversation(sessionId: string, message: ChatMessage): void {
  const history = conversationStore.get(sessionId) || [];
  history.push(message);
  // Keep last 20 messages for context
  if (history.length > 20) {
    history.splice(0, history.length - 20);
  }
  conversationStore.set(sessionId, history);
}

export function clearConversation(sessionId: string): void {
  conversationStore.delete(sessionId);
}

function buildContextualPrompt(userContext?: UserContext): string {
  let contextInfo = "";
  
  if (userContext) {
    if (userContext.username) {
      contextInfo += `\nUser: ${userContext.username}`;
    }
    if (userContext.isPro) {
      contextInfo += ` (Pro Member)`;
    }
    if (userContext.vehicles && userContext.vehicles.length > 0) {
      contextInfo += `\n\nUser's Garage (${userContext.vehicles.length} vehicles):`;
      userContext.vehicles.forEach((v, i) => {
        contextInfo += `\n${i + 1}. ${v.year || ''} ${v.make || ''} ${v.model || ''}${v.nickname ? ` "${v.nickname}"` : ''}${v.mileage ? ` - ${v.mileage.toLocaleString()} miles` : ''}`;
      });
    }
    if (userContext.selectedVehicle) {
      const v = userContext.selectedVehicle;
      contextInfo += `\n\nCurrently selected vehicle: ${v.year} ${v.make} ${v.model}${v.mileage ? ` with ${v.mileage.toLocaleString()} miles` : ''}`;
    }
    if (userContext.location) {
      contextInfo += `\nUser location: ${userContext.location}`;
    }
  }
  
  return contextInfo;
}

const SYSTEM_PROMPT = `You are Buddy, GarageBot's friendly AI assistant mascot. Your personality is upbeat, knowledgeable, and eager to help.

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

export async function chat(messages: ChatMessage[], userContext?: UserContext): Promise<string> {
  try {
    const contextInfo = buildContextualPrompt(userContext);
    const systemPrompt = SYSTEM_PROMPT + (contextInfo ? `\n\n--- USER CONTEXT ---${contextInfo}` : '');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
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

// Unified chat with session memory
export async function chatWithMemory(
  sessionId: string, 
  userMessage: string, 
  userContext?: UserContext
): Promise<string> {
  // Add user message to history
  addToConversation(sessionId, { role: "user", content: userMessage });
  
  // Get conversation history
  const history = getConversationHistory(sessionId);
  
  // Get AI response
  const response = await chat(history, userContext);
  
  // Add response to history
  addToConversation(sessionId, { role: "assistant", content: response });
  
  return response;
}

// Smart recommendations based on vehicle and mileage
export async function getSmartRecommendations(vehicle: VehicleContext): Promise<{
  urgentParts: string[];
  upcomingMaintenance: string[];
  seasonalSuggestions: string[];
  message: string;
}> {
  try {
    const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.mileage ? ` with ${vehicle.mileage.toLocaleString()} miles` : ''}`;
    const month = new Date().toLocaleString('default', { month: 'long' });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an automotive maintenance expert. Based on vehicle info and mileage, recommend parts and maintenance.

Return ONLY a JSON object:
{
  "urgentParts": ["part1", "part2"], // Parts likely needed soon based on mileage
  "upcomingMaintenance": ["service1", "service2"], // Maintenance due in next 5k miles
  "seasonalSuggestions": ["item1"], // Seasonal items for current month
  "message": "Brief friendly summary"
}

Common mileage intervals:
- 3-5k: Oil change
- 15k: Air filter, cabin filter
- 30k: Brake inspection, transmission fluid
- 50k: Spark plugs, coolant flush
- 60k: Timing belt check (some vehicles)
- 75k: Major service interval`
        },
        {
          role: "user",
          content: `Vehicle: ${vehicleInfo}\nCurrent month: ${month}\nProvide maintenance recommendations.`
        }
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    
    return {
      urgentParts: parsed.urgentParts || [],
      upcomingMaintenance: parsed.upcomingMaintenance || [],
      seasonalSuggestions: parsed.seasonalSuggestions || [],
      message: parsed.message || "Here are some recommendations for your vehicle."
    };
  } catch (error) {
    console.error("Recommendations error:", error);
    return {
      urgentParts: [],
      upcomingMaintenance: ["Regular oil change", "Tire rotation"],
      seasonalSuggestions: [],
      message: "Based on typical maintenance schedules, here are some suggestions."
    };
  }
}

// Generate DIY repair guide
export async function generateDIYGuide(
  vehicle: VehicleContext, 
  repairTask: string
): Promise<{
  title: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  estimatedTime: string;
  toolsNeeded: string[];
  partsNeeded: string[];
  steps: { step: number; instruction: string; tip?: string }[];
  warnings: string[];
  costSavings: string;
}> {
  try {
    const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert mechanic creating DIY repair guides. Write clear, safe instructions for home mechanics.

Return ONLY a JSON object:
{
  "title": "How to [task] on [vehicle]",
  "difficulty": "Easy" | "Moderate" | "Advanced",
  "estimatedTime": "30 minutes - 1 hour",
  "toolsNeeded": ["tool1", "tool2"],
  "partsNeeded": ["part1", "part2"],
  "steps": [
    { "step": 1, "instruction": "Step description", "tip": "Optional pro tip" }
  ],
  "warnings": ["Safety warning 1"],
  "costSavings": "Save $X vs shop price"
}

Always include safety warnings. Be specific to the vehicle when possible.`
        },
        {
          role: "user",
          content: `Create a DIY guide for: ${repairTask} on a ${vehicleInfo}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    console.error("DIY guide error:", error);
    return {
      title: `How to ${repairTask}`,
      difficulty: 'Moderate',
      estimatedTime: "1-2 hours",
      toolsNeeded: ["Basic socket set", "Screwdrivers"],
      partsNeeded: [],
      steps: [{ step: 1, instruction: "Consult your vehicle's service manual for specific instructions." }],
      warnings: ["Always disconnect the battery before electrical work.", "Use jack stands when working under a vehicle."],
      costSavings: "DIY can save 50-70% on labor costs"
    };
  }
}

// Get mechanic estimate
export async function getMechanicEstimate(
  vehicle: VehicleContext,
  repairTask: string,
  location?: string
): Promise<{
  laborHours: string;
  laborCostRange: string;
  partsEstimate: string;
  totalRange: string;
  diyOption: { possible: boolean; savings: string; difficulty: string };
  tips: string[];
}> {
  try {
    const vehicleInfo = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an automotive repair cost estimator. Provide realistic repair cost estimates.

Return ONLY a JSON object:
{
  "laborHours": "1.5 - 2 hours",
  "laborCostRange": "$120 - $200",
  "partsEstimate": "$50 - $150",
  "totalRange": "$170 - $350",
  "diyOption": {
    "possible": true,
    "savings": "Save $100-$180 on labor",
    "difficulty": "Moderate - needs basic tools"
  },
  "tips": ["Get multiple quotes", "Ask about warranty on parts"]
}

Base estimates on average US shop rates ($80-$120/hr). Be realistic.`
        },
        {
          role: "user",
          content: `Estimate cost for: ${repairTask} on a ${vehicleInfo}${location ? ` in ${location}` : ''}`
        }
      ],
      max_tokens: 400,
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
  } catch (error) {
    console.error("Estimate error:", error);
    return {
      laborHours: "1-3 hours (varies)",
      laborCostRange: "$80 - $300",
      partsEstimate: "Varies by part",
      totalRange: "Get quotes from local shops",
      diyOption: { possible: true, savings: "Can save on labor", difficulty: "Varies" },
      tips: ["Get 2-3 quotes from local shops", "Ask if they warranty their work"]
    };
  }
}

// Proactive alerts based on vehicle data
export async function getProactiveAlerts(vehicles: VehicleContext[]): Promise<{
  vehicleId: string;
  alertType: 'maintenance' | 'recall' | 'seasonal' | 'milestone';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: string;
}[]> {
  const alerts: any[] = [];
  const currentMonth = new Date().getMonth();
  
  for (const vehicle of vehicles) {
    const mileage = vehicle.mileage || 0;
    
    // Mileage-based alerts
    if (mileage > 0) {
      const nextInterval = Math.ceil(mileage / 5000) * 5000;
      if (nextInterval - mileage < 500) {
        alerts.push({
          vehicleId: vehicle.id,
          alertType: 'maintenance',
          priority: 'high',
          title: 'Oil Change Due Soon',
          message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is approaching ${nextInterval.toLocaleString()} miles`,
          action: 'Search for oil and filters'
        });
      }
      
      // Major service intervals
      const majorIntervals = [30000, 60000, 90000, 100000];
      for (const interval of majorIntervals) {
        if (mileage < interval && mileage > interval - 2000) {
          alerts.push({
            vehicleId: vehicle.id,
            alertType: 'milestone',
            priority: 'medium',
            title: `${(interval/1000)}K Mile Service`,
            message: `Time for a comprehensive ${(interval/1000)}K mile service`,
            action: 'View maintenance checklist'
          });
          break;
        }
      }
    }
    
    // Seasonal alerts
    if (currentMonth >= 9 && currentMonth <= 11) { // Fall
      alerts.push({
        vehicleId: vehicle.id,
        alertType: 'seasonal',
        priority: 'low',
        title: 'Winter Prep',
        message: 'Time to check antifreeze and battery before winter',
        action: 'Shop winter prep items'
      });
    } else if (currentMonth >= 2 && currentMonth <= 4) { // Spring
      alerts.push({
        vehicleId: vehicle.id,
        alertType: 'seasonal',
        priority: 'low',
        title: 'Spring Maintenance',
        message: 'Good time for wiper blades and cabin filter',
        action: 'Shop spring items'
      });
    }
  }
  
  return alerts;
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

// Supported Gemini models - gemini-3.6-flash and gemini-flash-latest are verified working
const MODELS = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash'
];

async function callGemini(contents, apiKey) {
  let lastError = null;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (res.status === 404) {
        // Model deprecated or not found, try next
        continue;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        lastError = new Error(errData.error?.message || `Gemini API error ${res.status}`);
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to generate response with Gemini');
}

export async function sendChatMessage(history, newMessage, destinationContext) {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const systemInstruction = destinationContext
    ? `You are a helpful, friendly travel assistant. The visitor is currently looking at ${destinationContext.name}, ${destinationContext.country}. Known facts: ${destinationContext.description}. Famous places here: ${destinationContext.famousPlaces.map(p => p.name).join(', ')}. Best time to visit: ${destinationContext.bestTimeToVisit}. Answer questions about trip duration, what to see, and when to go, grounded in this real information. Keep answers conversational and concise (2-4 sentences) unless asked for more detail.`
    : 'You are a helpful, friendly travel assistant. Help users plan trips and answer travel questions. Keep answers conversational and concise (2-4 sentences) unless asked for more detail.';

  const contents = [
    { role: 'user', parts: [{ text: systemInstruction + '\n\nPlease acknowledge and begin.' }] },
    { role: 'model', parts: [{ text: "I'm ready to help you plan your trip! What would you like to know?" }] },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: newMessage }] }
  ];

  return await callGemini(contents, apiKey);
}

export async function generateItinerary(destination, days, interests) {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured');

  const interestText = interests && interests.length > 0 ? `Traveler interests: ${interests.join(', ')}.` : '';

  const prompt = `Generate a ${days}-day itinerary for ${destination.name}, ${destination.country}, grounded in these known highlights: ${destination.famousPlaces.map(p => p.name).join(', ')}. ${interestText} Each day must feature different named activities — do not repeat the same activity description across days. Reference real places from the list above where possible. Return ONLY valid JSON in this exact shape, no markdown formatting or commentary: { "days": [{ "day": 1, "title": "Day title", "activities": ["activity 1", "activity 2", "activity 3"] }] }`;

  const contents = [
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const parseResponse = (text) => {
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    return JSON.parse(cleaned);
  };

  try {
    const text = await callGemini(contents, apiKey);
    return parseResponse(text);
  } catch (firstErr) {
    try {
      contents[0].parts[0].text += '\n\nIMPORTANT: Return ONLY the raw JSON object. No markdown, no code fences, no explanation. Just the JSON.';
      const text = await callGemini(contents, apiKey);
      return parseResponse(text);
    } catch (retryErr) {
      throw new Error('Failed to generate itinerary: ' + (retryErr.message || firstErr.message));
    }
  }
}

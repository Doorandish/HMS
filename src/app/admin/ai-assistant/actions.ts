'use server';

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateMarketingDescription(amenities: string[], propertyType: string) {
  try {
    if (!ai) {
      return { 
        success: true, 
        content: `Mock Marketing Description for a ${propertyType} with ${amenities.join(', ')}. This is a beautiful property that you will surely love!` 
      };
    }

    const prompt = `Write a short, engaging marketing description for a ${propertyType} rental. 
    It features the following amenities: ${amenities.join(', ')}. 
    Keep it under 3 paragraphs and highlight the best features.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return { success: true, content: response.text };
  } catch (error) {
    console.error('AI Generation Error:', error);
    return { success: false, error: 'Failed to generate description.' };
  }
}

export async function simulateBenchmarkRates(directPrice: number) {
  try {
    if (!ai) {
      return { 
        success: true, 
        data: {
          BookingCom: Number((directPrice * 1.15).toFixed(2)),
          Expedia: Number((directPrice * 1.18).toFixed(2)),
          Airbnb: Number((directPrice * 1.14).toFixed(2))
        }
      };
    }

    const prompt = `Given a hotel's direct website price of $${directPrice} per night, simulate realistic competitive rates for OTA channels (Booking.com, Expedia, Airbnb) incorporating typical commission markup (15-18%). Return ONLY a JSON object with the channel names as keys and the simulated numerical price as values. Example: {"BookingCom": 115.5, "Expedia": 118.0, "Airbnb": 114.5}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const data = JSON.parse(response.text || '{}');
    return { success: true, data };
  } catch (error) {
    console.error('AI Simulation Error:', error);
    return { success: false, error: 'Failed to simulate benchmark rates.' };
  }
}

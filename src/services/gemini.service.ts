import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateJSON(prompt: string, schema: any): Promise<any> {
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.8,
          topP: 0.9,
        },
      });
      
      const jsonString = response.text.trim();
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate content from AI. Please check the console for details.');
    }
  }

  async generateImages(prompt: string, numberOfImages: number): Promise<string[]> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: numberOfImages,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
      } else {
        throw new Error('Image generation failed: No images were returned.');
      }
    } catch (error) {
      console.error('Error calling Gemini Image API:', error);
      throw new Error('Failed to generate image from AI. Please check the console for details.');
    }
  }

  getCharacterSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'A creative and fitting name for the character.' },
        backstory: { type: Type.STRING, description: 'A compelling 2-3 paragraph origin story.' },
        powers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of unique powers and abilities.'
        },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of meaningful weaknesses or vulnerabilities that create conflict.'
        },
        visualDescription: { type: Type.STRING, description: 'A detailed description for concept art, including costume and appearance.' }
      },
      required: ['name', 'backstory', 'powers', 'weaknesses', 'visualDescription']
    };
  }

  getPlotSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        outlines: {
          type: Type.ARRAY,
          description: 'An array of three distinct episode plot outlines.',
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'A catchy title for the episode outline.' },
              plotPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of three key plot points for the story (e.g., beginning, middle, end).'
              }
            },
            required: ['title', 'plotPoints']
          }
        }
      },
      required: ['outlines']
    };
  }

  getStyleSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        styleName: { type: Type.STRING, description: 'A catchy name for this visual style.'},
        aesthetic: { type: Type.STRING, description: 'The overall aesthetic and mood.' },
        characterDesign: { type: Type.STRING, description: 'The approach to designing characters.' },
        colorPalette: { type: Type.STRING, description: 'The primary color scheme and its purpose.' },
        backgroundStyle: { type: Type.STRING, description: 'The style for backgrounds and environments.' }
      },
      required: ['styleName', 'aesthetic', 'characterDesign', 'colorPalette', 'backgroundStyle']
    };
  }
}

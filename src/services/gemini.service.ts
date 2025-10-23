import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import type { RawCharacterConcept, RawPlotOutline, RawVisualStyle, RawCharacterIntel } from '../models/marvel-concept.model.js';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // FIX: Per guidelines, API key must come from environment variables.
    if (!process.env.API_KEY) {
      throw new Error('API_KEY environment variable not set. Please configure it before running the application.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateJSON<T>(prompt: string, schema: any): Promise<T> {
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
      
      // FIX: Use response.text to extract content as per guidelines.
      const jsonString = response.text.trim();

      if (!jsonString) {
        throw new Error('No text content found in Gemini response.');
      }
      return JSON.parse(jsonString) as T;
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      const errorMessage = error?.message || 'An unknown error occurred';
      throw new Error(`Failed to generate valid JSON from AI. Reason: ${errorMessage}`);
    }
  }

  generateCharacterConcept(coreConcept: string): Promise<RawCharacterConcept> {
    const prompt = `Generate a detailed character blueprint for a new hero or villain in the Marvel universe. The character's core concept is: "${coreConcept}". Provide a creative name, a compelling backstory, a list of unique powers/abilities, a list of meaningful weaknesses, and a detailed visual description for concept art. Structure the response as a JSON object.`;
    return this.generateJSON<RawCharacterConcept>(prompt, this.getCharacterSchema());
  }

  generatePlotOutline(hero: string, villain: string, theme: string): Promise<RawPlotOutline> {
    const prompt = `Create three distinct episode plot outlines for a Marvel animated series. The episode should feature ${hero} facing off against ${villain} with a central theme of "${theme}". For each outline, provide a catchy title and three key plot points that cover the beginning, middle, and end of the story. Structure the response as a JSON object.`;
    return this.generateJSON<RawPlotOutline>(prompt, this.getPlotSchema());
  }

  generateVisualStyle(keywords: string): Promise<RawVisualStyle> {
    const prompt = `Develop a detailed visual style guide for a new Marvel animated series based on the following keywords: "${keywords}". Describe the overall aesthetic, character design approach, color palette, line weight, and background art style. Provide actionable notes for pre-production artists. Structure the response as a JSON object.`;
    return this.generateJSON<RawVisualStyle>(prompt, this.getStyleSchema());
  }
  
  generateCharacterIntel(characterName: string): Promise<RawCharacterIntel> {
    const prompt = `Generate a detailed intelligence briefing for the Marvel character: "${characterName}". The report should be structured for a SHIELD-style database. Include the character's full name, known aliases, primary base of operations, a summary of key abilities, a concise psychological profile, and a list of exploitable weaknesses. Structure the response as a JSON object.`;
    return this.generateJSON<RawCharacterIntel>(prompt, this.getIntelSchema());
  }

  generateConceptArt(prompt: string): Promise<string[]> {
    const fullPrompt = `Generate a high-quality, cinematic concept art image for the Marvel universe, suitable for pre-production. The prompt is: "${prompt}". The style should be dynamic and detailed.`;
    return this.generateImages(fullPrompt, 1);
  }

  generateComicStrip(story: string, panels: number, style: string): Promise<string[]> {
    const fullPrompt = `Generate a comic strip with ${panels} panels in a ${style} style. The story is: "${story}". Each generated image should be a distinct panel in sequence.`;
    return this.generateImages(fullPrompt, panels);
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
      throw error;
    }
  }
  
  async generateVideoShot(prompt: string, onProgress: (message: string) => void): Promise<Blob> {
    const fullPrompt = `Generate a short, cinematic, high-definition video shot suitable for a Marvel movie or series. The prompt is: "${prompt}". The shot should be dynamic and visually impressive.`;
    
    // FIX: Removed 'VideosOperation' type as it's not exported. Type is inferred.
    let operation = await this.ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: fullPrompt,
      config: {
        numberOfVideos: 1,
      }
    });

    const maxChecks = 30; // 5 minutes timeout (30 checks * 10 seconds)
    const pollInterval = 10000; // 10 seconds
    const progressMessages = [
      "Contacting Stark Industries for satellite uplink...",
      "Assembling the Avengers... of render nodes...",
      "Calibrating the Bifrost for data transmission...",
      "Harnessing the Power Cosmic... please wait...",
      "Entering the Quantum Realm to process your request...",
      "Compiling Pym Particles for video compression...",
    ];

    let checks = 0;
    while (!operation.done && checks < maxChecks) {
      checks++;
      const message = progressMessages[checks % progressMessages.length];
      onProgress(`${message} (Status check ${checks}/${maxChecks})`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      operation = await this.ai.operations.getVideosOperation({operation: operation});
    }

    if (!operation.done) {
      throw new Error('Video generation timed out after 5 minutes.');
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error('Video generation failed: No download link was returned.');
    }
    
    // FIX: Use environment variable for API key as required by guidelines.
    if (!process.env.API_KEY) {
       throw new Error('API key is not available to fetch the video.');
    }

    onProgress('Video generated. Downloading final asset...');
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to download video. Status: ${response.statusText}`);
    }

    return response.blob();
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
                description: 'A list of three key plot points for the story (e.g., beginning, middle, and end).'
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

  getIntelSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        characterName: { type: Type.STRING, description: 'The full name of the character being analyzed.' },
        aliases: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of known aliases or code names.'
        },
        baseOfOperations: { type: Type.STRING, description: 'The character\'s primary base of operations.' },
        abilities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of key powers and abilities.'
        },
        psychologicalProfile: { type: Type.STRING, description: 'A brief psychological analysis of the character, including motivations and personality traits.' },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of exploitable weaknesses, both physical and psychological.'
        }
      },
      required: ['characterName', 'aliases', 'baseOfOperations', 'abilities', 'psychologicalProfile', 'weaknesses']
    };
  }
}
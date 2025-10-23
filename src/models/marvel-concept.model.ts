export interface CharacterConcept {
  type: 'character';
  name: string;
  backstory: string;
  powers: string[];
  weaknesses: string[];
  visualDescription: string;
}

export interface SinglePlotOutline {
  title: string;
  plotPoints: string[];
}

export interface PlotOutline {
  type: 'plot';
  outlines: SinglePlotOutline[];
}

export interface VisualStyle {
  type: 'style';
  styleName: string;
  aesthetic: string;
  characterDesign: string;
  colorPalette: string;
  backgroundStyle: string;
}

export interface CharacterIntel {
  type: 'intel';
  characterName: string;
  aliases: string[];
  baseOfOperations: string;
  abilities: string[];
  psychologicalProfile: string;
  weaknesses: string[];
}

export interface VideoShot {
  type: 'video';
}

export type GeneratedConcept = CharacterConcept | PlotOutline | VisualStyle | CharacterIntel | VideoShot;

// Raw types for Gemini API response before being hydrated with a 'type' property
export interface RawCharacterConcept {
  name: string;
  backstory: string;
  powers: string[];
  weaknesses: string[];
  visualDescription: string;
}

export interface RawPlotOutline {
  outlines: SinglePlotOutline[];
}

export interface RawVisualStyle {
  styleName: string;
  aesthetic: string;
  characterDesign: string;
  colorPalette: string;
  backgroundStyle: string;
}

export interface RawCharacterIntel {
  characterName: string;
  aliases: string[];
  baseOfOperations: string;
  abilities: string[];
  psychologicalProfile: string;
  weaknesses: string[];
}

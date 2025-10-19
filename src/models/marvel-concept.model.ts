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

export type GeneratedConcept = CharacterConcept | PlotOutline | VisualStyle;
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';
import { GeneratedConcept, CharacterConcept, PlotOutline, VisualStyle } from './models/marvel-concept.model';
import { marvelHeroes, marvelVillains, marvelThemes } from './data/marvel-data';

type ActiveTab = 'character' | 'plot' | 'style' | 'concept-art' | 'comic-strip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  activeTab: WritableSignal<ActiveTab> = signal('character');
  isLoading = signal(false);
  error = signal<string | null>(null);
  generatedContent = signal<GeneratedConcept | null>(null);
  generatedImageUrls = signal<string[] | null>(null);

  // Data for dropdowns
  heroes = marvelHeroes;
  villains = marvelVillains;
  themes = marvelThemes;
  panelOptions = [2, 3, 4];
  comicStripStyles = ['Classic Comic', 'Manga', 'Noir', 'Gritty 90s', 'Sci-Fi Comic', 'Fantasy Comic', 'Superhero Comic'];

  // Form inputs
  characterInput = signal('A tech-based hero from a futuristic Wakandan outpost who can manipulate sound waves.');
  plotHeroInput = signal(this.heroes[0]);
  plotVillainInput = signal(this.villains[0]);
  plotThemeInput = signal(this.themes[0]);
  styleInput = signal('A blend of classic Jack Kirby cosmic energy with modern, fluid anime action sequences.');
  conceptArtInput = signal('A dynamic action shot of a new hero, soaring over a neon-lit futuristic city at night, energy crackling around them.');
  comicStripInput = signal('Spider-Man trying to buy groceries, but he forgot his wallet and the cashier is unimpressed.');
  comicStripPanels = signal(2);
  comicStripStyle = signal(this.comicStripStyles[0]);

  setActiveTab(tab: ActiveTab) {
    this.activeTab.set(tab);
    this.generatedContent.set(null);
    this.generatedImageUrls.set(null);
    this.error.set(null);
  }

  async generate() {
    this.isLoading.set(true);
    this.error.set(null);
    this.generatedContent.set(null);
    this.generatedImageUrls.set(null);

    try {
      const tab = this.activeTab();
      let response: any;
      if (tab === 'character') {
        const prompt = `Generate a detailed character blueprint for a new hero or villain in the Marvel universe. The character's core concept is: "${this.characterInput()}". Provide a creative name, a compelling backstory, a list of unique powers/abilities, a list of meaningful weaknesses, and a detailed visual description for concept art. Structure the response as a JSON object.`;
        response = await this.geminiService.generateJSON(prompt, this.geminiService.getCharacterSchema());
        this.generatedContent.set({ ...response, type: 'character' });
      } else if (tab === 'plot') {
        const prompt = `Create three distinct episode plot outlines for a Marvel animated series. The episode should feature ${this.plotHeroInput()} facing off against ${this.plotVillainInput()} with a central theme of "${this.plotThemeInput()}". For each outline, provide a catchy title and three key plot points that cover the beginning, middle, and end of the story. Structure the response as a JSON object.`;
        response = await this.geminiService.generateJSON(prompt, this.geminiService.getPlotSchema());
        this.generatedContent.set({ ...response, type: 'plot' });
      } else if (tab === 'style') {
        const prompt = `Develop a detailed visual style guide for a new Marvel animated series based on the following keywords: "${this.styleInput()}". Describe the overall aesthetic, character design approach, color palette, line weight, and background art style. Provide actionable notes for pre-production artists. Structure the response as a JSON object.`;
        response = await this.geminiService.generateJSON(prompt, this.geminiService.getStyleSchema());
        this.generatedContent.set({ ...response, type: 'style' });
      } else if (tab === 'concept-art') {
        const prompt = `Generate a high-quality, cinematic concept art image for the Marvel universe, suitable for pre-production. The prompt is: "${this.conceptArtInput()}". The style should be dynamic and detailed.`;
        const imageUrls = await this.geminiService.generateImages(prompt, 1);
        this.generatedImageUrls.set(imageUrls);
      } else if (tab === 'comic-strip') {
        const prompt = `Generate a comic strip with ${this.comicStripPanels()} panels in a ${this.comicStripStyle()} style. The story is: "${this.comicStripInput()}". Each generated image should be a distinct panel in sequence.`;
        const imageUrls = await this.geminiService.generateImages(prompt, this.comicStripPanels());
        this.generatedImageUrls.set(imageUrls);
      }
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  saveTextOutput(): void {
    const concept = this.generatedContent();
    if (!concept) return;

    let fileContent = '';
    let fileName = 'marvel-blueprint.txt';

    if (this.isCharacter(concept)) {
      fileName = `character-${concept.name.replace(/\s+/g, '_')}.txt`;
      fileContent = `Character Blueprint: ${concept.name}\n\n`;
      fileContent += `== BACKSTORY ==\n${concept.backstory}\n\n`;
      fileContent += `== POWERS & ABILITIES ==\n${concept.powers.map(p => `- ${p}`).join('\n')}\n\n`;
      fileContent += `== WEAKNESSES ==\n${concept.weaknesses.map(w => `- ${w}`).join('\n')}\n\n`;
      fileContent += `== VISUAL DESCRIPTION ==\n${concept.visualDescription}`;
    } else if (this.isPlot(concept)) {
      fileName = `plot-outlines.txt`;
      fileContent = `Episode Plot Outlines\n\n`;
      concept.outlines.forEach((outline, index) => {
        fileContent += `== OUTLINE ${index + 1}: ${outline.title} ==\n`;
        fileContent += `${outline.plotPoints.map(p => `- ${p}`).join('\n')}\n\n`;
      });
    } else if (this.isStyle(concept)) {
      fileName = `style-guide-${concept.styleName.replace(/\s+/g, '_')}.txt`;
      fileContent = `Visual Style Guide: ${concept.styleName}\n\n`;
      fileContent += `== OVERALL AESTHETIC ==\n${concept.aesthetic}\n\n`;
      fileContent += `== CHARACTER DESIGN ==\n${concept.characterDesign}\n\n`;
      fileContent += `== COLOR PALETTE ==\n${concept.colorPalette}\n\n`;
      fileContent += `== BACKGROUND & ENVIRONMENT STYLE ==\n${concept.backgroundStyle}`;
    }

    if (fileContent) {
      this._downloadTextFile(fileContent, fileName);
    }
  }

  private _downloadTextFile(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  saveConceptArt(url: string): void {
    if (!url) return;
    this._downloadImageFile(url, 'concept-art.jpeg');
  }

  saveComicPanel(url: string, index: number): void {
    if (!url) return;
    this._downloadImageFile(url, `comic-panel-${index + 1}.jpeg`);
  }

  private _downloadImageFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Type guard functions for template
  isCharacter(concept: GeneratedConcept | null): concept is CharacterConcept {
    return concept?.type === 'character';
  }

  isPlot(concept: GeneratedConcept | null): concept is PlotOutline {
    return concept?.type === 'plot';
  }

  isStyle(concept: GeneratedConcept | null): concept is VisualStyle {
    return concept?.type === 'style';
  }

  updateCharacterInput(event: Event) {
    this.characterInput.set((event.target as HTMLTextAreaElement).value);
  }

  updatePlotHeroInput(event: Event) {
    this.plotHeroInput.set((event.target as HTMLSelectElement).value);
  }

  updatePlotVillainInput(event: Event) {
    this.plotVillainInput.set((event.target as HTMLSelectElement).value);
  }

  updatePlotThemeInput(event: Event) {
    this.plotThemeInput.set((event.target as HTMLSelectElement).value);
  }

  updateStyleInput(event: Event) {
    this.styleInput.set((event.target as HTMLTextAreaElement).value);
  }
  
  updateConceptArtInput(event: Event) {
    this.conceptArtInput.set((event.target as HTMLTextAreaElement).value);
  }

  updateComicStripInput(event: Event) {
    this.comicStripInput.set((event.target as HTMLTextAreaElement).value);
  }

  updateComicStripPanels(event: Event) {
    this.comicStripPanels.set(Number((event.target as HTMLSelectElement).value));
  }

  updateComicStripStyle(event: Event) {
    this.comicStripStyle.set((event.target as HTMLSelectElement).value);
  }
}
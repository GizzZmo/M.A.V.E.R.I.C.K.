import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service.js';
import type { GeneratedConcept, CharacterConcept, PlotOutline, VisualStyle, CharacterIntel, VideoShot } from './models/marvel-concept.model.js';
import { marvelHeroes, marvelVillains, marvelThemes } from './data/marvel-data.js';

export enum AppTab {
  Character = 'character',
  Plot = 'plot',
  Style = 'style',
  Intel = 'intel',
  ConceptArt = 'concept-art',
  ComicStrip = 'comic-strip',
  VideoShot = 'video-shot'
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  public geminiService = inject(GeminiService);

  // Expose enum to template
  AppTab = AppTab;

  // FIX: Removed API key input signal as it's no longer needed.
  
  activeTab: WritableSignal<AppTab> = signal(AppTab.Character);
  isLoading = signal(false);
  loadingMessage = signal<string | null>(null);
  error = signal<string | null>(null);
  generatedContent = signal<GeneratedConcept | null>(null);
  generatedImageUrls = signal<string[] | null>(null);
  generatedVideoUrl = signal<string | null>(null);

  // Data for dropdowns
  heroes = marvelHeroes;
  villains = marvelVillains;
  themes = marvelThemes;
  panelOptions = [2, 3, 4];
  comicStripStyles = ['Classic Comic', 'Manga', 'Noir', 'Gritty 90s', 'Sci-Fi Comic', 'Fantasy Comic', 'Superhero Comic'];

  // Form inputs
  characterInput = signal('A tech-based hero from a futuristic Wakandan outpost who can manipulate sound waves.');
  plotHeroInput = signal('');
  plotVillainInput = signal('');
  plotThemeInput = signal('');
  styleInput = signal('A blend of classic Jack Kirby cosmic energy with modern, fluid anime action sequences.');
  intelInput = signal('Doctor Doom');
  conceptArtInput = signal('A dynamic action shot of a new hero, soaring over a neon-lit futuristic city at night, energy crackling around them.');
  comicStripInput = signal('Spider-Man trying to buy groceries, but he forgot his wallet and the cashier is unimpressed.');
  comicStripPanels = signal(2);
  comicStripStyle = signal(this.comicStripStyles[0]);
  videoShotInput = signal('Cinematic shot of Captain America throwing his shield in slow motion through a swarm of Ultron bots.');

  private lastVideoUrl: string | null = null;

  isFormInvalid = computed(() => {
    const tab = this.activeTab();
    if (tab === AppTab.Plot) {
      return !this.plotHeroInput() || !this.plotVillainInput() || !this.plotThemeInput();
    }
    return false;
  });

  ngOnDestroy() {
    this.revokeLastVideoUrl();
  }

  private revokeLastVideoUrl() {
    if (this.lastVideoUrl) {
      URL.revokeObjectURL(this.lastVideoUrl);
      this.lastVideoUrl = null;
    }
  }

  setActiveTab(tab: AppTab) {
    this.activeTab.set(tab);
    this.generatedContent.set(null);
    this.generatedImageUrls.set(null);
    this.generatedVideoUrl.set(null);
    this.revokeLastVideoUrl();
    this.error.set(null);
  }

  getTabClasses(tab: AppTab): string {
    const baseClasses = 'px-4 py-2 -mb-px text-sm font-semibold border-b-2 transition-colors duration-200';
    if (this.activeTab() === tab) {
      return `${baseClasses} text-sky-400 border-sky-400`;
    }
    return `${baseClasses} text-slate-400 border-transparent hover:text-sky-300`;
  }

  async generate() {
    this.isLoading.set(true);
    this.error.set(null);
    this.generatedContent.set(null);
    this.generatedImageUrls.set(null);
    this.generatedVideoUrl.set(null);
    this.loadingMessage.set(null);
    this.revokeLastVideoUrl();

    try {
      const tab = this.activeTab();
      if (tab === AppTab.Character) {
        const response = await this.geminiService.generateCharacterConcept(this.characterInput());
        this.generatedContent.set({ ...response, type: 'character' });
      } else if (tab === AppTab.Plot) {
        const response = await this.geminiService.generatePlotOutline(this.plotHeroInput(), this.plotVillainInput(), this.plotThemeInput());
        this.generatedContent.set({ ...response, type: 'plot' });
      } else if (tab === AppTab.Style) {
        const response = await this.geminiService.generateVisualStyle(this.styleInput());
        this.generatedContent.set({ ...response, type: 'style' });
      } else if (tab === AppTab.Intel) {
        const response = await this.geminiService.generateCharacterIntel(this.intelInput());
        this.generatedContent.set({ ...response, type: 'intel' });
      } else if (tab === AppTab.ConceptArt) {
        const imageUrls = await this.geminiService.generateConceptArt(this.conceptArtInput());
        this.generatedImageUrls.set(imageUrls);
      } else if (tab === AppTab.ComicStrip) {
        const imageUrls = await this.geminiService.generateComicStrip(
          this.comicStripInput(),
          this.comicStripPanels(),
          this.comicStripStyle()
        );
        this.generatedImageUrls.set(imageUrls);
      } else if (tab === AppTab.VideoShot) {
        this.loadingMessage.set('Initiating video generation...');
        const videoBlob = await this.geminiService.generateVideoShot(
          this.videoShotInput(),
          (message: string) => this.loadingMessage.set(message)
        );
        const videoUrl = URL.createObjectURL(videoBlob);
        this.generatedVideoUrl.set(videoUrl);
        this.lastVideoUrl = videoUrl;
        this.generatedContent.set({ type: 'video' });
      }
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
      this.loadingMessage.set(null);
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
    } else if (this.isIntel(concept)) {
      fileName = `intel-briefing-${concept.characterName.replace(/\s+/g, '_')}.txt`;
      fileContent = `INTELLIGENCE BRIEFING: ${concept.characterName.toUpperCase()}\n\n`;
      fileContent += `KNOWN ALIASES: ${concept.aliases.join(', ')}\n`;
      fileContent += `BASE OF OPERATIONS: ${concept.baseOfOperations}\n\n`;
      fileContent += `== ABILITIES ASSESSMENT ==\n${concept.abilities.map(p => `- ${p}`).join('\n')}\n\n`;
      fileContent += `== PSYCHOLOGICAL PROFILE ==\n${concept.psychologicalProfile}\n\n`;
      fileContent += `== EXPLOITABLE WEAKNESSES ==\n${concept.weaknesses.map(w => `- ${w}`).join('\n')}`;
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

  saveVideoShot(url: string): void {
    if (!url) return;
    this._downloadImageFile(url, 'video-shot.mp4');
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

  isIntel(concept: GeneratedConcept | null): concept is CharacterIntel {
    return concept?.type === 'intel';
  }

  isVideo(concept: GeneratedConcept | null): concept is VideoShot {
    return concept?.type === 'video';
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
  
  updateIntelInput(event: Event) {
    this.intelInput.set((event.target as HTMLInputElement).value);
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

  updateVideoShotInput(event: Event) {
    this.videoShotInput.set((event.target as HTMLTextAreaElement).value);
  }
  
  // FIX: Removed methods for API key modal.
}
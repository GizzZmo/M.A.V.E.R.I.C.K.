/**
 * @fileoverview Main application component for M.A.V.E.R.I.C.K. (Marvel AI-Vision Engine for Rapid Interactive Content Kreation).
 * This component provides a comprehensive pre-production blueprint generator for Marvel-themed content.
 * 
 * Features:
 * - Character concept generation with backstories and abilities
 * - Episode plot outline creation
 * - Visual style guide generation
 * - Character intelligence briefings (SHIELD-style)
 * - Concept art image generation
 * - Multi-panel comic strip creation
 * - Cinematic video shot generation
 */

import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service.js';
import { AuthService } from './services/auth.service.js';
import { ProjectService } from './services/project.service.js';
import { BatchGenerationService } from './services/batch-generation.service.js';
import type { GeneratedConcept, CharacterConcept, PlotOutline, VisualStyle, CharacterIntel, VideoShot } from './models/marvel-concept.model.js';
import { marvelHeroes, marvelVillains, marvelThemes, artStyles } from './data/marvel-data.js';

/**
 * Enumeration of available application tabs.
 * Each tab corresponds to a different content generation mode.
 */
export enum AppTab {
  /** Character concept generation */
  Character = 'character',
  /** Plot outline generation */
  Plot = 'plot',
  /** Visual style guide generation */
  Style = 'style',
  /** Character intelligence briefing */
  Intel = 'intel',
  /** Concept art generation */
  ConceptArt = 'concept-art',
  /** Comic strip generation */
  ComicStrip = 'comic-strip',
  /** Video shot generation */
  VideoShot = 'video-shot'
}

/**
 * Main application component for the Marvel Pre-Production Blueprint generator.
 * 
 * This component orchestrates the entire user interface and manages the state
 * for all generation modes. It provides a tabbed interface where users can
 * generate different types of Marvel-themed content using Google's Gemini AI.
 * 
 * @example
 * Usage in HTML:
 * ```html
 * <app-root></app-root>
 * ```
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  /** Injected Gemini AI service for content generation */
  public geminiService = inject(GeminiService);
  
  /** Injected Auth service for user authentication */
  public authService = inject(AuthService);
  
  /** Injected Project service for project management */
  public projectService = inject(ProjectService);
  
  /** Injected Batch Generation service for batch processing */
  public batchService = inject(BatchGenerationService);

  /** Expose AppTab enum to template */
  AppTab = AppTab;
  
  // === State Management Signals ===
  
  /** Currently active tab in the UI */
  activeTab: WritableSignal<AppTab> = signal(AppTab.Character);
  
  /** Loading state indicator */
  isLoading = signal(false);
  
  /** Loading message for long-running operations (e.g., video generation) */
  loadingMessage = signal<string | null>(null);
  
  /** Error message from failed generation attempts */
  error = signal<string | null>(null);
  
  /** Generated text content (character, plot, style, or intel) */
  generatedContent = signal<GeneratedConcept | null>(null);
  
  /** Generated image URLs for concept art and comic strips */
  generatedImageUrls = signal<string[] | null>(null);
  
  /** Generated video URL (as object URL from Blob) */
  generatedVideoUrl = signal<string | null>(null);
  
  // === New Feature UI State Signals ===
  
  /** Show authentication modal */
  showAuthModal = signal(false);
  
  /** Authentication form mode ('login' or 'signup') */
  authMode = signal<'login' | 'signup'>('login');
  
  /** Show project management panel */
  showProjectPanel = signal(false);
  
  /** Show batch generation panel */
  showBatchPanel = signal(false);
  
  /** Currently selected batch content type */
  batchContentType = signal<'character' | 'plot' | 'style' | 'intel' | 'concept-art'>('character');
  
  /** Batch input prompts (one per line) */
  batchInputs = signal('');
  
  /** Authentication form inputs */
  authEmail = signal('');
  authPassword = signal('');
  authName = signal('');
  
  /** Project form inputs */
  projectName = signal('');
  projectDescription = signal('');
  projectTags = signal('');

  // === UI Data Sources ===
  
  /** List of Marvel heroes for plot generation dropdown */
  heroes = marvelHeroes;
  
  /** List of Marvel villains for plot generation dropdown */
  villains = marvelVillains;
  
  /** List of narrative themes for plot generation dropdown */
  themes = marvelThemes;
  
  /** Available panel count options for comic strips */
  panelOptions = [2, 3, 4];
  
  /** Available art styles for comic strip generation */
  comicStripStyles = artStyles;

  // === Form Input Signals ===
  
  /** User input for character concept generation */
  characterInput = signal('A tech-based hero from a futuristic Wakandan outpost who can manipulate sound waves.');
  
  /** Selected hero for plot generation */
  plotHeroInput = signal('');
  
  /** Selected villain for plot generation */
  plotVillainInput = signal('');
  
  /** Selected theme for plot generation */
  plotThemeInput = signal('');
  
  /** User input for visual style guide generation */
  styleInput = signal('A blend of classic Jack Kirby cosmic energy with modern, fluid anime action sequences.');
  
  /** Character name for intelligence briefing */
  intelInput = signal('Doctor Doom');
  
  /** Description for concept art generation */
  conceptArtInput = signal('A dynamic action shot of a new hero, soaring over a neon-lit futuristic city at night, energy crackling around them.');
  
  /** Story description for comic strip generation */
  comicStripInput = signal('Spider-Man trying to buy groceries, but he forgot his wallet and the cashier is unimpressed.');
  
  /** Number of panels for comic strip */
  comicStripPanels = signal(2);
  
  /** Selected art style for comic strip */
  comicStripStyle = signal(this.comicStripStyles[0]);
  
  /** Description for video shot generation */
  videoShotInput = signal('Cinematic shot of Captain America throwing his shield in slow motion through a swarm of Ultron bots.');

  /** Tracks the last video URL created to ensure proper cleanup */
  private lastVideoUrl: string | null = null;

  /**
   * Computed signal that determines if the current form is invalid.
   * Currently only validates the plot generation form.
   */
  isFormInvalid = computed(() => {
    const tab = this.activeTab();
    if (tab === AppTab.Plot) {
      return !this.plotHeroInput() || !this.plotVillainInput() || !this.plotThemeInput();
    }
    return false;
  });
  
  /**
   * Computed signal that determines if there is content to save.
   */
  hasContentToSave = computed(() => {
    return !!(this.generatedContent() || this.generatedImageUrls() || this.generatedVideoUrl());
  });

  /**
   * Component cleanup lifecycle hook.
   * Ensures video URLs are properly revoked to prevent memory leaks.
   */
  ngOnDestroy() {
    this.revokeLastVideoUrl();
  }

  /**
   * Revokes the last created video object URL to free memory.
   * Called during cleanup and when generating new videos.
   * @private
   */
  private revokeLastVideoUrl() {
    if (this.lastVideoUrl) {
      URL.revokeObjectURL(this.lastVideoUrl);
      this.lastVideoUrl = null;
    }
  }

  /**
   * Sets the active tab and resets all generation state.
   * Clears any previously generated content, images, or videos.
   * 
   * @param {AppTab} tab - The tab to activate
   */
  setActiveTab(tab: AppTab) {
    this.activeTab.set(tab);
    this.generatedContent.set(null);
    this.generatedImageUrls.set(null);
    this.generatedVideoUrl.set(null);
    this.revokeLastVideoUrl();
    this.error.set(null);
  }

  /**
   * Returns CSS classes for tab styling based on active state.
   * 
   * @param {AppTab} tab - The tab to get classes for
   * @returns {string} CSS class string for the tab
   */
  getTabClasses(tab: AppTab): string {
    const baseClasses = 'px-4 py-2 -mb-px text-sm font-semibold border-b-2 transition-colors duration-200';
    if (this.activeTab() === tab) {
      return `${baseClasses} text-sky-400 border-sky-400`;
    }
    return `${baseClasses} text-slate-400 border-transparent hover:text-sky-300`;
  }

  /**
   * Main generation method that orchestrates content creation.
   * Routes to the appropriate generation method based on the active tab.
   * 
   * Handles loading states, error management, and result storage.
   * For video generation, provides progress updates via loading messages.
   * 
   * @async
   */
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
  
  /**
   * Saves generated text content (character, plot, style, or intel) to a file.
   * Formats the content appropriately based on the concept type and triggers a download.
   */
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

  /**
   * Downloads text content as a file.
   * 
   * @param {string} content - The text content to download
   * @param {string} fileName - The filename for the download
   * @private
   */
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

  /**
   * Saves a generated concept art image to a file.
   * 
   * @param {string} url - The image data URL
   */
  saveConceptArt(url: string): void {
    if (!url) return;
    this._downloadImageFile(url, 'concept-art.jpeg');
  }

  /**
   * Saves a comic strip panel to a file.
   * 
   * @param {string} url - The image data URL
   * @param {number} index - The panel index (0-based)
   */
  saveComicPanel(url: string, index: number): void {
    if (!url) return;
    this._downloadImageFile(url, `comic-panel-${index + 1}.jpeg`);
  }

  /**
   * Saves a generated video shot to a file.
   * 
   * @param {string} url - The video object URL
   */
  saveVideoShot(url: string): void {
    if (!url) return;
    this._downloadImageFile(url, 'video-shot.mp4');
  }

  /**
   * Downloads an image or video file.
   * 
   * @param {string} url - The file URL (data URL or object URL)
   * @param {string} fileName - The filename for the download
   * @private
   */
  private _downloadImageFile(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // === Type Guard Functions ===
  // These functions enable type-safe handling of different concept types in the template

  /**
   * Type guard to check if a concept is a CharacterConcept.
   * @param {GeneratedConcept | null} concept - The concept to check
   * @returns {boolean} True if the concept is a CharacterConcept
   */
  isCharacter(concept: GeneratedConcept | null): concept is CharacterConcept {
    return concept?.type === 'character';
  }

  /**
   * Type guard to check if a concept is a PlotOutline.
   * @param {GeneratedConcept | null} concept - The concept to check
   * @returns {boolean} True if the concept is a PlotOutline
   */
  isPlot(concept: GeneratedConcept | null): concept is PlotOutline {
    return concept?.type === 'plot';
  }

  /**
   * Type guard to check if a concept is a VisualStyle.
   * @param {GeneratedConcept | null} concept - The concept to check
   * @returns {boolean} True if the concept is a VisualStyle
   */
  isStyle(concept: GeneratedConcept | null): concept is VisualStyle {
    return concept?.type === 'style';
  }

  /**
   * Type guard to check if a concept is a CharacterIntel.
   * @param {GeneratedConcept | null} concept - The concept to check
   * @returns {boolean} True if the concept is a CharacterIntel
   */
  isIntel(concept: GeneratedConcept | null): concept is CharacterIntel {
    return concept?.type === 'intel';
  }

  /**
   * Type guard to check if a concept is a VideoShot.
   * @param {GeneratedConcept | null} concept - The concept to check
   * @returns {boolean} True if the concept is a VideoShot
   */
  isVideo(concept: GeneratedConcept | null): concept is VideoShot {
    return concept?.type === 'video';
  }

  // === Event Handlers for Form Inputs ===
  // These methods update signal values from DOM events

  /**
   * Updates the character input signal from textarea change.
   * @param {Event} event - The change event
   */
  updateCharacterInput(event: Event) {
    this.characterInput.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Updates the plot hero selection.
   * @param {Event} event - The change event
   */
  updatePlotHeroInput(event: Event) {
    this.plotHeroInput.set((event.target as HTMLSelectElement).value);
  }

  /**
   * Updates the plot villain selection.
   * @param {Event} event - The change event
   */
  updatePlotVillainInput(event: Event) {
    this.plotVillainInput.set((event.target as HTMLSelectElement).value);
  }

  /**
   * Updates the plot theme selection.
   * @param {Event} event - The change event
   */
  updatePlotThemeInput(event: Event) {
    this.plotThemeInput.set((event.target as HTMLSelectElement).value);
  }

  /**
   * Updates the visual style input.
   * @param {Event} event - The change event
   */
  updateStyleInput(event: Event) {
    this.styleInput.set((event.target as HTMLTextAreaElement).value);
  }
  
  /**
   * Updates the character intelligence briefing input.
   * @param {Event} event - The change event
   */
  updateIntelInput(event: Event) {
    this.intelInput.set((event.target as HTMLInputElement).value);
  }
  
  /**
   * Updates the concept art description input.
   * @param {Event} event - The change event
   */
  updateConceptArtInput(event: Event) {
    this.conceptArtInput.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Updates the comic strip story input.
   * @param {Event} event - The change event
   */
  updateComicStripInput(event: Event) {
    this.comicStripInput.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Updates the comic strip panel count.
   * @param {Event} event - The change event
   */
  updateComicStripPanels(event: Event) {
    this.comicStripPanels.set(Number((event.target as HTMLSelectElement).value));
  }

  /**
   * Updates the comic strip art style.
   * @param {Event} event - The change event
   */
  updateComicStripStyle(event: Event) {
    this.comicStripStyle.set((event.target as HTMLSelectElement).value);
  }

  /**
   * Updates the video shot description input.
   * @param {Event} event - The change event
   */
  updateVideoShotInput(event: Event) {
    this.videoShotInput.set((event.target as HTMLTextAreaElement).value);
  }
  
  // === Authentication Methods ===
  
  /**
   * Opens the authentication modal in the specified mode.
   * @param {'login' | 'signup'} mode - The authentication mode
   */
  openAuthModal(mode: 'login' | 'signup' = 'login') {
    this.authMode.set(mode);
    this.showAuthModal.set(true);
    this.authEmail.set('');
    this.authPassword.set('');
    this.authName.set('');
  }
  
  /**
   * Closes the authentication modal.
   */
  closeAuthModal() {
    this.showAuthModal.set(false);
  }
  
  /**
   * Handles user login.
   */
  async handleLogin() {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.authService.login(this.authEmail(), this.authPassword());
      this.closeAuthModal();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Login failed');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Handles user signup.
   */
  async handleSignup() {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.authService.signup(this.authEmail(), this.authPassword(), this.authName());
      this.closeAuthModal();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Handles user logout.
   */
  handleLogout() {
    this.authService.logout();
  }
  
  /**
   * Updates auth email input.
   * @param {Event} event - The input event
   */
  updateAuthEmail(event: Event) {
    this.authEmail.set((event.target as HTMLInputElement).value);
  }
  
  /**
   * Updates auth password input.
   * @param {Event} event - The input event
   */
  updateAuthPassword(event: Event) {
    this.authPassword.set((event.target as HTMLInputElement).value);
  }
  
  /**
   * Updates auth name input.
   * @param {Event} event - The input event
   */
  updateAuthName(event: Event) {
    this.authName.set((event.target as HTMLInputElement).value);
  }
  
  // === Project Management Methods ===
  
  /**
   * Toggles the project management panel.
   */
  toggleProjectPanel() {
    this.showProjectPanel.update(val => !val);
  }
  
  /**
   * Creates a new project.
   */
  async createProject() {
    if (!this.projectName()) {
      this.error.set('Project name is required');
      return;
    }
    
    try {
      const userId = this.authService.currentUser()?.id;
      if (!userId) {
        this.error.set('You must be logged in to create a project');
        return;
      }
      
      this.isLoading.set(true);
      this.error.set(null);
      
      const projectTagsValue = this.projectTags();
      const tags = projectTagsValue 
        ? projectTagsValue.split(',').map(t => t.trim()).filter(t => t)
        : [];
      
      await this.projectService.createProject(
        this.projectName(),
        this.projectDescription(),
        userId,
        tags
      );
      
      // Reset form
      this.projectName.set('');
      this.projectDescription.set('');
      this.projectTags.set('');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Saves current generated content to the active project.
   */
  async saveToProject() {
    const content = this.generatedContent();
    const images = this.generatedImageUrls();
    const video = this.generatedVideoUrl();
    
    if (!content && !images && !video) {
      this.error.set('No content to save');
      return;
    }
    
    try {
      this.isLoading.set(true);
      this.error.set(null);
      
      let contentType: 'character' | 'plot' | 'style' | 'intel' | 'concept-art' | 'comic-strip' | 'video';
      let prompt = '';
      
      switch (this.activeTab()) {
        case AppTab.Character:
          contentType = 'character';
          prompt = this.characterInput();
          break;
        case AppTab.Plot:
          contentType = 'plot';
          prompt = `${this.plotHeroInput()} vs ${this.plotVillainInput()} - ${this.plotThemeInput()}`;
          break;
        case AppTab.Style:
          contentType = 'style';
          prompt = this.styleInput();
          break;
        case AppTab.Intel:
          contentType = 'intel';
          prompt = this.intelInput();
          break;
        case AppTab.ConceptArt:
          contentType = 'concept-art';
          prompt = this.conceptArtInput();
          break;
        case AppTab.ComicStrip:
          contentType = 'comic-strip';
          prompt = this.comicStripInput();
          break;
        case AppTab.VideoShot:
          contentType = 'video';
          prompt = this.videoShotInput();
          break;
        default:
          contentType = 'character';
          prompt = '';
      }
      
      await this.projectService.addContentToCurrentProject({
        contentType,
        concept: content || undefined,
        imageUrls: images || undefined,
        videoUrl: video || undefined,
        prompt
      });
      
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to save to project');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Exports the current project as JSON.
   */
  async exportProject() {
    try {
      const currentProject = this.projectService.currentProject();
      if (!currentProject) {
        this.error.set('No active project to export');
        return;
      }
      
      this.isLoading.set(true);
      this.error.set(null);
      await this.projectService.exportProject(currentProject.id);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to export project');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  /**
   * Updates project name input.
   * @param {Event} event - The input event
   */
  updateProjectName(event: Event) {
    this.projectName.set((event.target as HTMLInputElement).value);
  }
  
  /**
   * Updates project description input.
   * @param {Event} event - The input event
   */
  updateProjectDescription(event: Event) {
    this.projectDescription.set((event.target as HTMLTextAreaElement).value);
  }
  
  /**
   * Updates project tags input.
   * @param {Event} event - The input event
   */
  updateProjectTags(event: Event) {
    this.projectTags.set((event.target as HTMLInputElement).value);
  }
  
  // === Batch Generation Methods ===
  
  /**
   * Toggles the batch generation panel.
   */
  toggleBatchPanel() {
    this.showBatchPanel.update(val => !val);
  }
  
  /**
   * Updates batch content type.
   * @param {Event} event - The change event
   */
  updateBatchContentType(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'character' || value === 'plot' || value === 'style' || value === 'intel' || value === 'concept-art') {
      this.batchContentType.set(value);
    }
  }
  
  /**
   * Updates batch inputs.
   * @param {Event} event - The input event
   */
  updateBatchInputs(event: Event) {
    this.batchInputs.set((event.target as HTMLTextAreaElement).value);
  }
  
  /**
   * Starts batch generation.
   */
  async startBatchGeneration() {
    const inputs = this.batchInputs()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (inputs.length === 0) {
      this.error.set('Please enter at least one prompt (one per line)');
      return;
    }
    
    try {
      this.isLoading.set(true);
      this.error.set(null);
      
      const type = this.batchContentType();
      
      switch (type) {
        case 'character':
          await this.batchService.batchGenerateCharacters(inputs);
          break;
        case 'plot':
          // For plots, we need hero, villain, theme - use first input as theme
          const plotInputs = inputs.map(theme => ({
            hero: this.plotHeroInput() || 'Spider-Man',
            villain: this.plotVillainInput() || 'Green Goblin',
            theme
          }));
          await this.batchService.batchGeneratePlots(plotInputs);
          break;
        case 'style':
          await this.batchService.batchGenerateStyles(inputs);
          break;
        case 'intel':
          await this.batchService.batchGenerateIntel(inputs);
          break;
        case 'concept-art':
          await this.batchService.batchGenerateConceptArt(inputs);
          break;
      }
      
      // Reset batch inputs after successful generation
      this.batchInputs.set('');
      
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Batch generation failed');
    } finally {
      this.isLoading.set(false);
    }
  }
}
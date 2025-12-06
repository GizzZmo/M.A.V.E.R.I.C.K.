/**
 * @fileoverview Project management service for M.A.V.E.R.I.C.K.
 * Provides project creation, saving, loading, and session management.
 */

import { Injectable, signal } from '@angular/core';
import type { GeneratedConcept } from '../models/marvel-concept.model.js';

/**
 * Represents a content item within a project.
 */
export interface ProjectContent {
  /** Unique identifier for this content */
  id: string;
  /** Timestamp when content was created */
  createdAt: Date;
  /** Type of content */
  contentType: 'character' | 'plot' | 'style' | 'intel' | 'concept-art' | 'comic-strip' | 'video';
  /** Generated concept data (for text-based content) */
  concept?: GeneratedConcept;
  /** Image URLs (for image-based content) */
  imageUrls?: string[];
  /** Video URL (for video content) */
  videoUrl?: string;
  /** Original input/prompt used to generate this content */
  prompt: string;
}

/**
 * Represents a project containing multiple generated content items.
 */
export interface Project {
  /** Unique project identifier */
  id: string;
  /** Project name */
  name: string;
  /** Project description */
  description: string;
  /** Owner user ID */
  ownerId: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
  /** Array of content items in this project */
  contents: ProjectContent[];
  /** Project tags for organization */
  tags: string[];
}

/**
 * Service for managing projects and sessions in M.A.V.E.R.I.C.K.
 * 
 * This service provides:
 * - Project creation and management
 * - Content organization within projects
 * - Project persistence to local storage
 * - Project import/export
 * - Session management
 * 
 * @example
 * ```typescript
 * const projectService = inject(ProjectService);
 * const project = projectService.createProject('My Marvel Project', 'Description');
 * projectService.addContentToCurrentProject(content);
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  /** Local storage key for projects */
  private readonly PROJECTS_KEY = 'maverick_projects';
  /** Local storage key for current project ID */
  private readonly CURRENT_PROJECT_KEY = 'maverick_current_project';

  /** Currently active project */
  currentProject = signal<Project | null>(null);

  /** List of all user projects */
  projects = signal<Project[]>([]);

  /**
   * Initializes the project service.
   * Loads projects from local storage and restores the last active project.
   */
  constructor() {
    this.loadProjects();
    this.restoreCurrentProject();
  }

  /**
   * Creates a new project.
   * 
   * @param {string} name - Project name
   * @param {string} description - Project description
   * @param {string} ownerId - User ID of the project owner
   * @param {string[]} tags - Optional project tags
   * @returns {Project} The newly created project
   */
  createProject(name: string, description: string, ownerId: string, tags: string[] = []): Project {
    const project: Project = {
      id: this.generateId(),
      name,
      description,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      contents: [],
      tags,
    };

    const currentProjects = this.projects();
    this.projects.set([...currentProjects, project]);
    this.saveProjects();

    return project;
  }

  /**
   * Sets the current active project.
   * 
   * @param {string} projectId - ID of the project to activate
   * @returns {boolean} True if project was found and activated
   */
  setCurrentProject(projectId: string): boolean {
    const project = this.projects().find(p => p.id === projectId);
    if (project) {
      this.currentProject.set(project);
      localStorage.setItem(this.CURRENT_PROJECT_KEY, projectId);
      return true;
    }
    return false;
  }

  /**
   * Adds content to the currently active project.
   * 
   * @param {ProjectContent} content - Content to add
   * @returns {boolean} True if content was added successfully
   */
  addContentToCurrentProject(content: ProjectContent): boolean {
    const current = this.currentProject();
    if (!current) return false;

    current.contents.push(content);
    current.updatedAt = new Date();
    
    this.updateProjectInList(current);
    this.saveProjects();

    return true;
  }

  /**
   * Creates a new content item for a project.
   * 
   * @param {string} prompt - The prompt used to generate this content
   * @param {ProjectContent['contentType']} contentType - Type of content
   * @param {GeneratedConcept} concept - Generated concept (optional)
   * @param {string[]} imageUrls - Image URLs (optional)
   * @param {string} videoUrl - Video URL (optional)
   * @returns {ProjectContent} The created content item
   */
  createContent(
    prompt: string,
    contentType: ProjectContent['contentType'],
    concept?: GeneratedConcept,
    imageUrls?: string[],
    videoUrl?: string
  ): ProjectContent {
    return {
      id: this.generateId(),
      createdAt: new Date(),
      contentType,
      concept,
      imageUrls,
      videoUrl,
      prompt,
    };
  }

  /**
   * Updates an existing project.
   * 
   * @param {string} projectId - ID of the project to update
   * @param {Partial<Project>} updates - Partial project data to update
   * @returns {boolean} True if update was successful
   */
  updateProject(projectId: string, updates: Partial<Project>): boolean {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) return false;

    Object.assign(project, updates);
    project.updatedAt = new Date();

    this.updateProjectInList(project);
    this.saveProjects();

    // Update current project if it's the one being updated
    if (this.currentProject()?.id === projectId) {
      this.currentProject.set({ ...project });
    }

    return true;
  }

  /**
   * Deletes a project.
   * 
   * @param {string} projectId - ID of the project to delete
   * @returns {boolean} True if deletion was successful
   */
  deleteProject(projectId: string): boolean {
    const currentProjects = this.projects();
    const index = currentProjects.findIndex(p => p.id === projectId);
    
    if (index === -1) return false;

    currentProjects.splice(index, 1);
    this.projects.set([...currentProjects]);
    this.saveProjects();

    // Clear current project if it was deleted
    if (this.currentProject()?.id === projectId) {
      this.currentProject.set(null);
      localStorage.removeItem(this.CURRENT_PROJECT_KEY);
    }

    return true;
  }

  /**
   * Exports a project as a JSON file.
   * 
   * @param {string} projectId - ID of the project to export
   * @returns {string | null} JSON string of the project, or null if not found
   */
  exportProject(projectId: string): string | null {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) return null;

    return JSON.stringify(project, null, 2);
  }

  /**
   * Imports a project from JSON.
   * 
   * @param {string} jsonString - JSON string representation of a project
   * @returns {Project | null} The imported project, or null if import failed
   */
  importProject(jsonString: string): Project | null {
    try {
      const projectData = JSON.parse(jsonString);
      
      // Validate required fields
      if (!projectData.name || !projectData.ownerId) {
        throw new Error('Invalid project data');
      }

      // Restore Date objects
      const project: Project = {
        ...projectData,
        id: this.generateId(), // Generate new ID to avoid conflicts
        createdAt: new Date(projectData.createdAt),
        updatedAt: new Date(projectData.updatedAt),
        contents: projectData.contents?.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })) || [],
      };

      const currentProjects = this.projects();
      this.projects.set([...currentProjects, project]);
      this.saveProjects();

      return project;
    } catch (error) {
      console.error('Failed to import project:', error);
      return null;
    }
  }

  /**
   * Removes a content item from a project.
   * 
   * @param {string} projectId - ID of the project
   * @param {string} contentId - ID of the content to remove
   * @returns {boolean} True if removal was successful
   */
  removeContentFromProject(projectId: string, contentId: string): boolean {
    const project = this.projects().find(p => p.id === projectId);
    if (!project) return false;

    const index = project.contents.findIndex(c => c.id === contentId);
    if (index === -1) return false;

    project.contents.splice(index, 1);
    project.updatedAt = new Date();

    this.updateProjectInList(project);
    this.saveProjects();

    return true;
  }

  /**
   * Gets all projects owned by a specific user.
   * 
   * @param {string} ownerId - User ID
   * @returns {Project[]} Array of projects owned by the user
   */
  getProjectsByOwner(ownerId: string): Project[] {
    return this.projects().filter(p => p.ownerId === ownerId);
  }

  /**
   * Loads all projects from local storage.
   * @private
   */
  private loadProjects(): void {
    const projectsJson = localStorage.getItem(this.PROJECTS_KEY);
    if (!projectsJson) {
      this.projects.set([]);
      return;
    }

    try {
      const projectsData = JSON.parse(projectsJson);
      const projects: Project[] = projectsData.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        contents: p.contents?.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        })) || [],
      }));
      this.projects.set(projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.projects.set([]);
    }
  }

  /**
   * Saves all projects to local storage.
   * @private
   */
  private saveProjects(): void {
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(this.projects()));
  }

  /**
   * Restores the last active project from local storage.
   * @private
   */
  private restoreCurrentProject(): void {
    const projectId = localStorage.getItem(this.CURRENT_PROJECT_KEY);
    if (projectId) {
      this.setCurrentProject(projectId);
    }
  }

  /**
   * Updates a project in the projects list.
   * 
   * @param {Project} updatedProject - The updated project
   * @private
   */
  private updateProjectInList(updatedProject: Project): void {
    const currentProjects = this.projects();
    const index = currentProjects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      currentProjects[index] = updatedProject;
      this.projects.set([...currentProjects]);
    }
  }

  /**
   * Generates a unique identifier.
   * @returns {string} Unique identifier
   * @private
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

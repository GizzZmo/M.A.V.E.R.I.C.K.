/**
 * @fileoverview Team management service for M.A.V.E.R.I.C.K.
 * Provides team creation, membership management, and role-based permission checks.
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import type { Team, TeamMember, TeamRole } from '../models/marvel-concept.model.js';
import { AuthService } from './auth.service.js';

/** localStorage key for team data */
const TEAMS_KEY = 'maverick_teams';

/**
 * Service for managing teams and role-based permissions.
 *
 * Features:
 * - Create and delete teams
 * - Invite and remove members
 * - Update member roles
 * - Permission checks (canEdit, canManage)
 * - Reactive current-team signal
 *
 * All data is persisted in localStorage; designed for backend integration.
 *
 * @example
 * ```typescript
 * const teamService = inject(TeamService);
 * const team = teamService.createTeam('Avengers Initiative', 'Core MCU team');
 * teamService.addMember(team.id, { userId: 'user_2', name: 'Nat', email: 'nat@shield.gov', role: 'editor' });
 * teamService.canEdit(team.id); // true if current user has editor or owner role
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private authService = inject(AuthService);

  /** All teams, keyed by team ID */
  private teamsMap = signal<Map<string, Team>>(this.loadTeams());

  /** Currently selected team ID */
  private _currentTeamId = signal<string | null>(null);

  // ── Public reactive state ────────────────────────────────────────────────

  /** All teams as a flat array */
  readonly allTeams = computed<Team[]>(() =>
    Array.from(this.teamsMap().values())
  );

  /** Teams the current user belongs to */
  readonly myTeams = computed<Team[]>(() => {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return [];
    return this.allTeams().filter(t =>
      t.members.some(m => m.userId === userId)
    );
  });

  /** The currently selected team (or null) */
  readonly currentTeam = computed<Team | null>(() => {
    const id = this._currentTeamId();
    return id ? (this.teamsMap().get(id) ?? null) : null;
  });

  // ── Team CRUD ────────────────────────────────────────────────────────────

  /**
   * Creates a new team owned by the current user.
   *
   * @param name        - Display name for the team
   * @param description - Optional description
   * @returns The newly created Team
   * @throws If no user is authenticated
   */
  createTeam(name: string, description: string = ''): Team {
    const user = this.authService.currentUser();
    if (!user) throw new Error('Must be authenticated to create a team.');

    const ownerMember: TeamMember = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    };

    const team: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: name.trim(),
      description: description.trim(),
      ownerId: user.id,
      members: [ownerMember],
      projectIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.upsertTeam(team);
    return team;
  }

  /**
   * Updates the name and/or description of a team.
   *
   * @param teamId      - Team to update
   * @param name        - New display name
   * @param description - New description
   */
  updateTeam(teamId: string, name: string, description: string): void {
    this.requireManagePermission(teamId);
    const team = this.getTeamOrThrow(teamId);
    this.upsertTeam({ ...team, name, description, updatedAt: new Date().toISOString() });
  }

  /**
   * Deletes a team. Only the owner may do this.
   *
   * @param teamId - Team to delete
   */
  deleteTeam(teamId: string): void {
    const user = this.authService.currentUser();
    const team = this.getTeamOrThrow(teamId);
    if (team.ownerId !== user?.id) {
      throw new Error('Only the team owner can delete the team.');
    }
    const updated = new Map(this.teamsMap());
    updated.delete(teamId);
    this.teamsMap.set(updated);
    this.persistTeams();
    if (this._currentTeamId() === teamId) this._currentTeamId.set(null);
  }

  // ── Membership ───────────────────────────────────────────────────────────

  /**
   * Adds a new member to a team.
   * Requires manage (owner) permission.
   *
   * @param teamId - Team to add the member to
   * @param member - Member details (userId, name, email, role)
   */
  addMember(
    teamId: string,
    member: Omit<TeamMember, 'joinedAt'>
  ): void {
    this.requireManagePermission(teamId);
    const team = this.getTeamOrThrow(teamId);

    if (team.members.some(m => m.userId === member.userId)) {
      throw new Error('User is already a member of this team.');
    }

    const newMember: TeamMember = { ...member, joinedAt: new Date().toISOString() };
    this.upsertTeam({
      ...team,
      members: [...team.members, newMember],
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Removes a member from a team.
   * Requires manage permission, or the user removing themselves.
   *
   * @param teamId - Team ID
   * @param userId - User to remove
   */
  removeMember(teamId: string, userId: string): void {
    const currentUser = this.authService.currentUser();
    const team = this.getTeamOrThrow(teamId);

    // Allow self-removal or owner action
    if (currentUser?.id !== userId) {
      this.requireManagePermission(teamId);
    }
    if (team.ownerId === userId) {
      throw new Error('The team owner cannot be removed. Transfer ownership first.');
    }

    this.upsertTeam({
      ...team,
      members: team.members.filter(m => m.userId !== userId),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Updates the role of an existing team member.
   * Requires manage (owner) permission.
   *
   * @param teamId - Team ID
   * @param userId - Member whose role to change
   * @param role   - New role
   */
  updateMemberRole(teamId: string, userId: string, role: TeamRole): void {
    this.requireManagePermission(teamId);
    const team = this.getTeamOrThrow(teamId);
    if (team.ownerId === userId && role !== 'owner') {
      throw new Error('Cannot change the owner\'s role. Transfer ownership first.');
    }
    this.upsertTeam({
      ...team,
      members: team.members.map(m =>
        m.userId === userId ? { ...m, role } : m
      ),
      updatedAt: new Date().toISOString(),
    });
  }

  // ── Project association ───────────────────────────────────────────────────

  /**
   * Associates a project with a team.
   *
   * @param teamId    - Team ID
   * @param projectId - Project to add
   */
  addProject(teamId: string, projectId: string): void {
    this.requireManagePermission(teamId);
    const team = this.getTeamOrThrow(teamId);
    if (team.projectIds.includes(projectId)) return;
    this.upsertTeam({
      ...team,
      projectIds: [...team.projectIds, projectId],
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Removes a project association from a team.
   *
   * @param teamId    - Team ID
   * @param projectId - Project to remove
   */
  removeProject(teamId: string, projectId: string): void {
    this.requireManagePermission(teamId);
    const team = this.getTeamOrThrow(teamId);
    this.upsertTeam({
      ...team,
      projectIds: team.projectIds.filter(id => id !== projectId),
      updatedAt: new Date().toISOString(),
    });
  }

  // ── Active team selection ─────────────────────────────────────────────────

  /**
   * Sets the currently active team.
   *
   * @param teamId - ID of the team to select, or null to deselect
   */
  selectTeam(teamId: string | null): void {
    this._currentTeamId.set(teamId);
  }

  // ── Permission helpers ────────────────────────────────────────────────────

  /**
   * Returns the current user's role in the specified team,
   * or null if they are not a member.
   *
   * @param teamId - Team to check
   */
  getRole(teamId: string): TeamRole | null {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return null;
    const team = this.teamsMap().get(teamId);
    return team?.members.find(m => m.userId === userId)?.role ?? null;
  }

  /**
   * Returns true if the current user can edit content in the team
   * (role: owner or editor).
   *
   * @param teamId - Team to check
   */
  canEdit(teamId: string): boolean {
    const role = this.getRole(teamId);
    return role === 'owner' || role === 'editor';
  }

  /**
   * Returns true if the current user can manage team membership and settings
   * (role: owner only).
   *
   * @param teamId - Team to check
   */
  canManage(teamId: string): boolean {
    return this.getRole(teamId) === 'owner';
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private upsertTeam(team: Team): void {
    const updated = new Map(this.teamsMap());
    updated.set(team.id, team);
    this.teamsMap.set(updated);
    this.persistTeams();
  }

  private getTeamOrThrow(teamId: string): Team {
    const team = this.teamsMap().get(teamId);
    if (!team) throw new Error(`Team ${teamId} not found.`);
    return team;
  }

  private requireManagePermission(teamId: string): void {
    if (!this.canManage(teamId)) {
      throw new Error('Only the team owner can perform this action.');
    }
  }

  private persistTeams(): void {
    const teams = Array.from(this.teamsMap().values());
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  }

  private loadTeams(): Map<string, Team> {
    try {
      const raw = localStorage.getItem(TEAMS_KEY);
      if (!raw) return new Map();
      const teams: Team[] = JSON.parse(raw);
      return new Map(teams.map(t => [t.id, t]));
    } catch {
      return new Map();
    }
  }
}

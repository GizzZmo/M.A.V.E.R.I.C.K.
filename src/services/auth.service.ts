/**
 * @fileoverview Authentication service for M.A.V.E.R.I.C.K.
 * Provides user authentication, session management, and JWT token handling.
 */

import { Injectable, signal, computed } from '@angular/core';

/**
 * Represents a user in the system.
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** User registration timestamp */
  createdAt: Date;
}

/**
 * Authentication response from login/signup.
 */
export interface AuthResponse {
  /** The authenticated user */
  user: User;
  /** JWT authentication token */
  token: string;
}

/**
 * Service for handling user authentication and session management.
 * 
 * This service provides:
 * - User registration and login
 * - JWT token management
 * - Session persistence
 * - User state tracking
 * 
 * @example
 * ```typescript
 * const authService = inject(AuthService);
 * await authService.login('user@example.com', 'password');
 * const isLoggedIn = authService.isAuthenticated();
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Local storage key for authentication token */
  private readonly TOKEN_KEY = 'maverick_auth_token';
  /** Local storage key for user data */
  private readonly USER_KEY = 'maverick_user_data';

  /** Current authenticated user (null if not logged in) */
  private currentUser = signal<User | null>(null);

  /** JWT authentication token */
  private authToken = signal<string | null>(null);

  /** Computed signal indicating if user is authenticated */
  isAuthenticated = computed(() => this.currentUser() !== null);

  /** Computed signal for current user data */
  user = computed(() => this.currentUser());

  /**
   * Initializes the authentication service.
   * Attempts to restore session from local storage.
   */
  constructor() {
    this.restoreSession();
  }

  /**
   * Registers a new user account.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} name - User's display name
   * @returns {Promise<AuthResponse>} Authentication response with user and token
   * @throws {Error} If registration fails
   */
  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    // Simulate API call - in production, this would call a real backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validate inputs
        if (!email || !password || !name) {
          reject(new Error('All fields are required'));
          return;
        }

        if (password.length < 6) {
          reject(new Error('Password must be at least 6 characters'));
          return;
        }

        // Check if user already exists in localStorage
        const existingUsers = this.getStoredUsers();
        if (existingUsers.some(u => u.email === email)) {
          reject(new Error('User with this email already exists'));
          return;
        }

        // Create new user
        const user: User = {
          id: this.generateId(),
          email,
          name,
          createdAt: new Date(),
        };

        // Generate mock JWT token
        const token = this.generateToken(user);

        // Store user in mock database
        existingUsers.push(user);
        localStorage.setItem('maverick_users', JSON.stringify(existingUsers));

        // Set current session
        this.setSession(user, token);

        resolve({ user, token });
      }, 500);
    });
  }

  /**
   * Authenticates an existing user.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<AuthResponse>} Authentication response with user and token
   * @throws {Error} If login fails
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate API call - in production, this would call a real backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Validate inputs
        if (!email || !password) {
          reject(new Error('Email and password are required'));
          return;
        }

        // Find user in mock database
        const existingUsers = this.getStoredUsers();
        const user = existingUsers.find(u => u.email === email);

        if (!user) {
          reject(new Error('Invalid email or password'));
          return;
        }

        // In production, verify password hash here
        // For demo purposes, we accept any password for existing users

        // Generate mock JWT token
        const token = this.generateToken(user);

        // Set current session
        this.setSession(user, token);

        resolve({ user, token });
      }, 500);
    });
  }

  /**
   * Logs out the current user and clears session.
   */
  logout(): void {
    this.clearSession();
    this.currentUser.set(null);
    this.authToken.set(null);
  }

  /**
   * Restores user session from local storage if available.
   * @private
   */
  private restoreSession(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);

    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        // Restore Date object
        user.createdAt = new Date(user.createdAt);
        
        this.currentUser.set(user);
        this.authToken.set(token);
      } catch (error) {
        // If restore fails, clear corrupted session
        this.clearSession();
      }
    }
  }

  /**
   * Saves current session to local storage.
   * 
   * @param {User} user - User to save
   * @param {string} token - Authentication token
   * @private
   */
  private setSession(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.authToken.set(token);
  }

  /**
   * Clears session data from local storage.
   * @private
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Retrieves all stored users from local storage.
   * @returns {User[]} Array of registered users
   * @private
   */
  private getStoredUsers(): User[] {
    const usersJson = localStorage.getItem('maverick_users');
    if (!usersJson) return [];
    
    try {
      const users = JSON.parse(usersJson);
      // Restore Date objects
      return users.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Generates a unique user ID.
   * @returns {string} Unique identifier
   * @private
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Generates a mock JWT token for a user.
   * In production, this would be generated by the backend.
   * 
   * @param {User} user - User to generate token for
   * @returns {string} Mock JWT token
   * @private
   */
  private generateToken(user: User): string {
    // This is a mock token - in production, use a real JWT
    const payload = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    return `Bearer.${payload}.${Date.now()}`;
  }
}

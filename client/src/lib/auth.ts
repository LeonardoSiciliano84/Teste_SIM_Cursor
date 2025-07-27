import { type User } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private currentUser: User | null = null;
  private listeners: Set<(state: AuthState) => void> = new Set();

  getState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: !!this.currentUser,
    };
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      const { user } = await response.json();
      this.currentUser = user;
      this.notify();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro de conexão" };
    }
  }

  logout() {
    this.currentUser = null;
    this.notify();
  }
}

export const authManager = new AuthManager();

import { useState, useEffect } from "react";
import { type User } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private currentUser: User | null = null;
  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    // Tentar restaurar sessão do localStorage na inicialização
    this.restoreSession();
  }

  getState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: !!this.currentUser,
    };
  }

  private restoreSession() {
    try {
      const savedUser = localStorage.getItem('felka_auth_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.notify();
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      localStorage.removeItem('felka_auth_user');
    }
  }

  private saveSession(user: User) {
    localStorage.setItem('felka_auth_user', JSON.stringify(user));
  }

  private clearSession() {
    localStorage.removeItem('felka_auth_user');
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
      this.saveSession(user);
      this.notify();
      return { success: true };
    } catch (error) {
      return { success: false, error: "Erro de conexão" };
    }
  }

  logout() {
    this.currentUser = null;
    this.clearSession();
    this.notify();
  }

  // Verificar se usuário pode acessar área administrativa
  canAccessAdmin(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'user';
  }

  // Verificar se usuário é motorista
  isDriver(): boolean {
    return this.currentUser?.role === 'driver';
  }
}

export const authManager = new AuthManager();

// Hook personalizado para usar autenticação
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    canAccessAdmin: authManager.canAccessAdmin,
    isDriver: authManager.isDriver,
    login: authManager.login.bind(authManager),
    logout: authManager.logout.bind(authManager),
  };
};

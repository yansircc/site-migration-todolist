import { create } from "zustand";
import type { TodoMap, TodoStatus, UrlSettings } from "@/types/todo";

interface TodoStore {
  // State
  todos: TodoMap;
  settings: UrlSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTodos: (todos: TodoMap) => void;
  setSettings: (settings: UrlSettings) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;

  // API Actions
  fetchInitialData: () => Promise<void>;
  updateTodoStatus: (
    url: string,
    status: TodoStatus,
    userId: string,
  ) => Promise<void>;
  updateMigratedUrl: (
    originalUrl: string,
    migratedUrl: string,
  ) => Promise<void>;
  updateSettings: (settings: UrlSettings) => Promise<void>;
}

const defaultSettings: UrlSettings = {
  source: "https://zetarmold.com",
  target: "https://google.com",
};

function checkNeeds301(originalUrl: string, migratedUrl: string): boolean {
  const normalizeUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace(/\/+$/, "");
      return path;
    } catch {
      return url.replace(/\/+$/, "");
    }
  };

  const getBasePath = (path: string) => {
    return path.replace(/\/+$/, "").split("/").pop() ?? "";
  };

  const originalPath = normalizeUrl(originalUrl);
  const migratedPath = normalizeUrl(migratedUrl);

  if (originalPath === migratedPath) {
    return false;
  }

  const originalBase = getBasePath(originalPath);
  const migratedBase = getBasePath(migratedPath);

  return originalBase !== migratedBase || originalPath !== migratedPath;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  // Initial state
  todos: {},
  settings: defaultSettings,
  isLoading: false,
  error: null,

  // Basic state setters
  setTodos: (todos) => set({ todos }),
  setSettings: (settings) => set({ settings }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  // API Actions
  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [todosResponse, settingsResponse] = await Promise.all([
        fetch("/api/todos"),
        fetch("/api/settings"),
      ]);

      if (!todosResponse.ok) throw new Error("Failed to fetch todos");
      if (!settingsResponse.ok) throw new Error("Failed to fetch settings");

      const todosData = (await todosResponse.json()) as TodoMap;
      const settingsData = (await settingsResponse.json()) as UrlSettings;

      set({
        todos: todosData,
        settings: settingsData,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
        isLoading: false,
      });
    }
  },

  updateTodoStatus: async (url, status, userId) => {
    const { todos } = get();
    const newTodos = {
      ...todos,
      [url]: {
        ...todos[url],
        url,
        status,
        assignee: status === "inProgress" ? userId : undefined,
        updatedAt: Date.now(),
      },
    };

    try {
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodos),
      });

      if (!response.ok) throw new Error("Failed to update todos");
      set({ todos: newTodos });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update todo status",
      });
    }
  },

  updateMigratedUrl: async (originalUrl, migratedUrl) => {
    const { todos } = get();
    const needs301 = checkNeeds301(originalUrl, migratedUrl);
    const currentTodo = todos[originalUrl] ?? {
      status: "pending",
      url: "",
      updatedAt: Date.now(),
    };
    const newTodos = {
      ...todos,
      [originalUrl]: {
        ...currentTodo,
        migratedUrl,
        needs301,
        updatedAt: Date.now(),
      },
    };

    try {
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodos),
      });

      if (!response.ok) throw new Error("Failed to update todos");
      set({ todos: newTodos });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update migrated URL",
      });
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to update settings");
      set({ settings });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update settings",
      });
    }
  },
}));

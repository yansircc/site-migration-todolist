export type TodoStatus = "completed" | "pending" | "inProgress" | "questioned";

export interface TodoItem {
  url: string;
  status: TodoStatus;
  assignee?: string;
  updatedAt: number;
  migratedUrl?: string;
  needs301?: boolean;
}

export interface User {
  name: string;
  id: string;
}

export interface UrlSettings {
  source: string;
  target: string;
}

export type TodoMap = Record<string, TodoItem>;

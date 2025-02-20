"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "./user-avatar";
import { ProgressBar } from "./progress-bar";
import { UrlInputDialog } from "./url-input-dialog";
import type { TodoItem, TodoMap, TodoStatus } from "@/types/todo";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

const statusColors: Record<TodoStatus, string> = {
  completed: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-gray-50 text-gray-700 border-gray-200",
  inProgress: "bg-blue-50 text-blue-700 border-blue-200",
  questioned: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const statusIcons: Record<TodoStatus, string> = {
  completed: "✓",
  pending: "○",
  inProgress: "►",
  questioned: "?",
};

interface TodoListProps {
  urls: string[];
  userId: string;
  userName: string;
}

const defaultTodo: TodoItem = {
  status: "pending",
  url: "",
  updatedAt: Date.now(),
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function checkNeeds301(originalUrl: string, migratedUrl: string): boolean {
  const normalizeUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Remove trailing slashes and normalize the path
      const path = urlObj.pathname.replace(/\/+$/, ""); // Remove trailing slashes
      return path;
    } catch {
      // If not a valid URL, just clean the string
      return url.replace(/\/+$/, "");
    }
  };

  const getBasePath = (path: string) => {
    // Remove trailing slashes and get the final segment
    return path.replace(/\/+$/, "").split("/").pop() ?? "";
  };

  const originalPath = normalizeUrl(originalUrl);
  const migratedPath = normalizeUrl(migratedUrl);

  // If paths are exactly the same (ignoring trailing slashes), no 301 needed
  if (originalPath === migratedPath) {
    return false;
  }

  // If only the base paths (final segments) are the same, but full paths differ,
  // then we need a 301 (e.g., /a vs /post/a)
  const originalBase = getBasePath(originalPath);
  const migratedBase = getBasePath(migratedPath);

  // If even the base paths are different, we definitely need a 301
  return originalBase !== migratedBase || originalPath !== migratedPath;
}

export function TodoList({ urls, userId, userName }: TodoListProps) {
  const [todos, setTodos] = useState<TodoMap>({});

  useEffect(() => {
    async function loadTodos() {
      try {
        const response = await fetch("/api/todos");
        if (!response.ok) throw new Error("Failed to fetch todos");
        const data = (await response.json()) as TodoMap;
        setTodos(data);
      } catch (error) {
        console.error("Failed to load todos:", error);
      }
    }
    void loadTodos();
  }, []);

  async function updateTodoStatus(url: string, status: TodoStatus) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodos),
      });
      if (!response.ok) throw new Error("Failed to update todos");
      setTodos(newTodos);
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }

  async function updateMigratedUrl(originalUrl: string, migratedUrl: string) {
    const needs301 = checkNeeds301(originalUrl, migratedUrl);
    const currentTodo = todos[originalUrl] ?? defaultTodo;
    const newTodos: TodoMap = {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodos),
      });
      if (!response.ok) throw new Error("Failed to update todos");
      setTodos(newTodos);
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white/90 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Migration Progress
        </h2>
        <ProgressBar todos={todos} totalItems={urls.length} />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {urls.map((url) => {
          const todo: TodoItem = {
            ...defaultTodo,
            ...todos[url],
            url,
          };

          return (
            <motion.div
              key={url}
              variants={item}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white/90 transition-all hover:border-gray-200"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500">
                    {statusIcons[todo.status]}
                  </span>
                  <motion.select
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    value={todo.status}
                    onChange={(e) =>
                      void updateTodoStatus(url, e.target.value as TodoStatus)
                    }
                    className={cn(
                      "rounded-lg border px-4 py-2 transition-all",
                      statusColors[todo.status],
                      "hover:border-gray-300",
                    )}
                  >
                    <option value="pending">Pending</option>
                    <option value="inProgress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="questioned">Questioned</option>
                  </motion.select>
                </div>

                <div className="flex flex-1 items-center justify-between">
                  <UrlInputDialog
                    originalUrl={url}
                    migratedUrl={todo.migratedUrl}
                    onUpdate={(newUrl) => void updateMigratedUrl(url, newUrl)}
                  />

                  <div className="flex items-center gap-3">
                    {todo.needs301 && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
                        <AlertCircle className="h-3 w-3" />
                        301
                      </span>
                    )}
                    <AnimatePresence>
                      {todo.assignee && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                        >
                          <UserAvatar
                            name={
                              todo.assignee === userId
                                ? userName
                                : todo.assignee
                            }
                            className="border border-gray-100"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

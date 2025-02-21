"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "./user-avatar";
import { ProgressBar } from "./progress-bar";
import { UrlInputDialog } from "./url-input-dialog";
import type { TodoItem, TodoStatus } from "@/types/todo";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { useTodoStore } from "@/store/todo";

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

export function TodoList({ urls, userId, userName }: TodoListProps) {
  const {
    todos,
    settings,
    isLoading,
    error,
    fetchInitialData,
    updateTodoStatus,
    updateMigratedUrl,
  } = useTodoStore();

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-100 bg-white/90">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-red-100 bg-white/90">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white/90 p-6">
        <ProgressBar todos={todos} totalItems={urls.length} />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {urls.map((url) => {
          const todo = {
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
                      void updateTodoStatus(
                        url,
                        e.target.value as TodoStatus,
                        userId,
                      )
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
                    baseUrls={settings}
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

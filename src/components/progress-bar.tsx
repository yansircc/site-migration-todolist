"use client";

import { motion } from "framer-motion";
import type { TodoMap, TodoStatus } from "@/types/todo";

interface ProgressBarProps {
  todos: TodoMap;
  totalItems: number;
}

const statusConfig: Record<TodoStatus, { color: string; label: string }> = {
  completed: { color: "bg-green-500", label: "Completed" },
  inProgress: { color: "bg-blue-500", label: "In Progress" },
  questioned: { color: "bg-yellow-500", label: "Needs Review" },
  pending: { color: "bg-gray-200", label: "Pending" },
};

export function ProgressBar({ todos, totalItems }: ProgressBarProps) {
  // First count all non-pending statuses
  const statusCounts = Object.values(todos).reduce(
    (acc, todo) => {
      if (todo.status !== "pending") {
        acc[todo.status] = (acc[todo.status] || 0) + 1;
      }
      return acc;
    },
    {} as Record<TodoStatus, number>,
  );

  // Calculate pending count as total minus all other statuses
  const nonPendingCount = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  statusCounts.pending = totalItems - nonPendingCount;

  // Calculate percentages for each status
  const segments = Object.entries(statusConfig).map(([status, config]) => ({
    status: status as TodoStatus,
    percentage: ((statusCounts[status as TodoStatus] || 0) / totalItems) * 100,
    ...config,
  }));

  return (
    <div className="space-y-2">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
        {segments.map(
          ({ status, percentage, color }, index) =>
            percentage > 0 && (
              <motion.div
                key={status}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${color} transition-all`}
              />
            ),
        )}
      </div>
      <div className="flex justify-center gap-4 text-sm">
        {segments.map(({ status, percentage, color, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="text-gray-600">
              {label}: {Math.round(percentage)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

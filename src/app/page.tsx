"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urls } from "@/data/urls";
import { TodoList } from "@/components/todo-list";
import type { User } from "@/types/todo";
import { SettingsDialog } from "@/components/settings-dialog";
import { useTodoStore } from "@/store/todo";

// Generate a unique ID based on timestamp and random number
function generateUserId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { settings, updateSettings } = useTodoStore();
  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  function handleUserSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser = {
      name: formData.get("name") as string,
      id: user?.id ?? generateUserId(), // Keep existing ID if editing, generate new one if new user
    };
    setUser(newUser);
    setIsEditing(false);
  }

  const UserForm = () => (
    <motion.form
      onSubmit={handleUserSubmit}
      className="space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <motion.input
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          type="text"
          id="name"
          name="name"
          required
          defaultValue={user?.name}
          className="mt-2 block w-full rounded-lg border border-gray-200 bg-white/50 px-4 py-3 backdrop-blur-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          placeholder="Enter your name"
        />
      </div>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex-1 rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        >
          {user ? "Save Changes" : "Start Working"}
        </motion.button>
        {isEditing && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.form>
  );

  if (!user || isEditing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={fadeIn}
          className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white/80 p-8 backdrop-blur-sm"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-bold text-transparent"
          >
            {isEditing ? "Edit Your Name" : "Welcome"}
          </motion.h1>
          <UserForm />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between rounded-2xl border border-gray-100 bg-white/90 p-6 backdrop-blur-sm"
        >
          <h1 className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-bold text-transparent">
            Zetar URLs Todo List
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Working as:{" "}
              <motion.strong
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-900"
              >
                {user.name}
              </motion.strong>
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              Edit Name
            </motion.button>
            <SettingsDialog settings={settings} onUpdate={updateSettings} />
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          <TodoList
            key="todo-list"
            urls={urls}
            userId={user.id}
            userName={user.name}
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

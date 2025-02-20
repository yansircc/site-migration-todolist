"use client";

import * as React from "react";
import { ArrowRight, Pencil } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface UrlInputDialogProps {
  originalUrl: string;
  migratedUrl?: string;
  onUpdate: (url: string) => void;
}

function formatUrlDisplay(url: string): string {
  // Remove domain and trailing slashes
  const path = url.replace("https://zetarmold.com/", "").replace(/\/+$/, "");
  // If path is empty, return 'home'
  return path || "home";
}

export function UrlInputDialog({
  originalUrl,
  migratedUrl,
  onUpdate,
}: UrlInputDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(migratedUrl ?? "");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="group flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-gray-600 hover:text-gray-900"
          >
            {formatUrlDisplay(originalUrl)}
          </a>
          <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
          {migratedUrl ? (
            <a
              href={migratedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-blue-600 hover:text-blue-700"
            >
              {formatUrlDisplay(migratedUrl)}
            </a>
          ) : (
            <span className="italic text-gray-400">No new URL set</span>
          )}
        </div>
        <Dialog.Trigger asChild>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 opacity-0 hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
            title={migratedUrl ? "Edit migrated URL" : "Add new URL"}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="text-lg font-semibold">
            Update Migration URL
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-500">
            Enter the new URL for this page after migration.
          </Dialog.Description>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">
                Original URL
              </label>
              <div className="mt-1 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {originalUrl}
              </div>
            </div>
            <div>
              <label
                htmlFor="newUrl"
                className="text-xs font-medium text-gray-500"
              >
                New URL
              </label>
              <input
                id="newUrl"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="Enter the new URL"
                autoFocus
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="rounded-md border px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
              Cancel
            </Dialog.Close>
            <button
              onClick={() => {
                onUpdate(inputValue);
                setOpen(false);
              }}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

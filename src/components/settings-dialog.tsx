"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings } from "lucide-react";
import type { UrlSettings } from "@/types/todo";

interface SettingsDialogProps {
  settings: UrlSettings;
  onUpdate: (settings: UrlSettings) => void;
}

export function SettingsDialog({ settings, onUpdate }: SettingsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState(settings);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          title="Configure URL settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="text-lg font-semibold">
            URL Migration Settings
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-500">
            Configure the base URLs for source and target environments.
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Source Base URL
              </label>
              <input
                type="url"
                value={localSettings.source}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    source: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="e.g., https://legacy-site.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                The base URL of the source/legacy website
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Target Base URL
              </label>
              <input
                type="url"
                value={localSettings.target}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    target: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="e.g., https://new-site.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                The base URL of the target/new website
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="rounded-md border px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">
              Cancel
            </Dialog.Close>
            <button
              onClick={() => {
                onUpdate(localSettings);
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

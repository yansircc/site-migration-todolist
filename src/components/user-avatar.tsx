"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  name: string;
}

export function UserAvatar({ name, className, ...props }: UserAvatarProps) {
  // Get first character, handling both English and Chinese characters
  const initial = name.charAt(0);

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <AvatarPrimitive.Fallback className="bg-muted flex h-full w-full items-center justify-center rounded-full">
        <span className="text-sm font-medium">{initial}</span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      toastOptions={{
        className: "border-[0.5px] border-[--edu-border] bg-[--edu-surface-raised] text-white",
      }}
    />
  );
}

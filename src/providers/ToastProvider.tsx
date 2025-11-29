"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "rgb(var(--card))",
          color: "rgb(var(--card-foreground))",
          border: "1px solid rgb(var(--border))",
        },
        success: {
          iconTheme: {
            primary: "rgb(var(--primary))",
            secondary: "rgb(var(--primary-foreground))",
          },
        },
        error: {
          iconTheme: {
            primary: "rgb(var(--destructive))",
            secondary: "rgb(var(--destructive-foreground))",
          },
        },
      }}
    />
  );
}

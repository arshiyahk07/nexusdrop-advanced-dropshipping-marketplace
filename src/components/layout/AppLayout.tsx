import React from "react";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";
import { Toaster } from "@/components/ui/sonner";
type AppLayoutProps = {
  children: React.ReactNode;
};
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
      <Toaster richColors closeButton />
    </div>
  );
}
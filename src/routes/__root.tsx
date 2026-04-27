import {
  Outlet,
  createRootRoute,
} from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { TRPCReactProvider } from "~/trpc/react";
import { LanguageProvider } from "~/contexts/LanguageContext";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <TRPCReactProvider>
      <LanguageProvider>
        <Toaster position="top-right" />
        <Outlet />
      </LanguageProvider>
    </TRPCReactProvider>
  );
}

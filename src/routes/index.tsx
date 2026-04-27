import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "~/stores/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const authToken = useAuthStore((state) => state.authToken);

  if (authToken) {
    return <Navigate to="/app/dashboard" />;
  }

  return <Navigate to="/login" />;
}

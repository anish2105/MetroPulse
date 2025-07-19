import { auth } from "@/firebase/config";
import MetroPulse from "@/landing";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/feed")({
  component: RouteComponent,
  loader: async () => {
    const user = auth.currentUser;
    if (!user) {
      throw redirect({ to: "/" }); // Redirect to home if not authenticated
    }
    return user;
  },
});

function RouteComponent() {
  return <MetroPulse />;
}

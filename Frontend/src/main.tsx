import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "./components/ui/theme-provider";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "./context/AuthContext";
const router = createRouter({ routeTree, context: { auth: undefined! } });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={router}  />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);

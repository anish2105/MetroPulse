import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@tanstack/react-router";

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState<"login" | "signup" | null>(null);
  const auth = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (auth?.user) {
      router.navigate({ to: "/feed" });
    }
  }, [auth?.user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <div className="max-w-xl text-center text-white">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">MetroPulse</h1>
        <p className="text-xl mb-8 opacity-90">
          Real-time city insights, alerts, and trends for Bengaluru.  
          Stay informed, stay ahead.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-blue-700 font-bold hover:bg-blue-100"
            onClick={() => setAuthModalOpen("login")}
          >
            Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white font-bold hover:bg-white hover:text-blue-700"
            onClick={() => setAuthModalOpen("signup")}
          >
            Sign Up
          </Button>
        </div>
      </div>
      <Dialog open={!!authModalOpen} onOpenChange={() => setAuthModalOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {authModalOpen === "login" ? "Login to MetroPulse" : "Sign Up for MetroPulse"}
            </DialogTitle>
            <DialogClose asChild>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setAuthModalOpen(null)}
              >
                ×
              </button>
            </DialogClose>
          </DialogHeader>
          {authModalOpen && (
            <AuthForm
              mode={authModalOpen}
              onClose={() => setAuthModalOpen(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <footer className="absolute bottom-4 w-full text-center text-white/70 text-xs">
        &copy; {new Date().getFullYear()} MetroPulse. All rights reserved.
      </footer>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AuthForm({
  mode = "login",
  onClose,
}: {
  mode?: "login" | "signup";
  onClose?: () => void;
}) {
  const auth = useAuth();
  if (!auth) throw new Error("useAuth must be used within AuthProvider");
  const { login, signup, loginWithGoogle, user, logout } = auth;
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    return (
      <div className="p-4 flex flex-col items-center">
        <div className="mb-2">Welcome, {user.email}</div>
        <Button onClick={logout} className="w-full mb-2">
          Logout
        </Button>
        {onClose && (
          <Button variant="secondary" onClick={onClose} className="w-full">
            Close
          </Button>
        )}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="p-2 max-w-xs mx-auto">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button className="w-full" type="submit">
          {isLogin ? "Login" : "Sign Up"}
        </Button>
        <Separator />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={async () => {
            try {
              await loginWithGoogle();
              if (onClose) onClose();
            } catch (err: any) {
              setError(err.message);
            }
          }}
        >
          Continue with Google
        </Button>
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            className="text-blue-600 underline"
            onClick={() => setIsLogin((v) => !v)}
          >
            {isLogin ? "Create an account" : "Already have an account?"}
          </Button>
        </div>
      </form>
    </div>
  );
}

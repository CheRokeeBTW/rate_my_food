"use client";

import { Feed } from "@/components/feed/Feed";
import { useState } from "react";
import RegisterForm from "@/components/auth/RegisterForm";
import LoginForm from "@/components/auth/LoginForm";
import NavBar from "@/components/navbar/NavBar";
import UploadModal from "@/components/upload/UploadModal";

export default function Home() {
  const [authModal, setAuthModal] = useState<"register" | "login" | null>(null);

  return (
    <div className="min-h-screen bg-zinc-900">
      <header className="flex w-full justify-end">
        <NavBar onRequireAuth={() => setAuthModal("login")}/>
        </header>
      <main className="flex min-h-screen justify-center items-center">
        <Feed onRequireAuth={() => setAuthModal("login")}/>
          </main>
        {authModal === "register" && (
            <RegisterForm
                onClose={() => setAuthModal(null)}
                onSwitchToLogin={() => setAuthModal("login")}
            />
        )}
        {authModal === "login" && (
            <LoginForm
                onClose={() => setAuthModal(null)}
                onSwitchToRegister={() => setAuthModal("register")}
            />
        )}
        {/* <UploadModal onClose = {() => setAuthModal(null)}  /> */}
    </div>
  );
}

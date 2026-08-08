"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { registerUser } from "@/app/services/auth.service";
import { X } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
});

type RegisterFormProps = {
    onClose: () => void;
    onSwitchToLogin: () => void;
};

type Errors = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  server: string;
};

const emptyErrors: Errors = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  server: "",
};

export default function RegisterForm({ onClose, onSwitchToLogin } : RegisterFormProps){
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<Errors>(emptyErrors)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const router = useRouter();

    const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[A-Za-z0-9\s-]+$/;

    setErrors(emptyErrors);

    if (!emailRegex.test(email)) {
      setErrors(prev => ({
        ...prev,
        email: "Enter a valid email",
      }));
      return;
    }

    if (!usernameRegex.test(username)) {
      setErrors(prev => ({
        ...prev,
        username: "Username can contain only letters, numbers and -",
      }));
      return;
    }

    if (username.length < 2 || username.length > 20) {
      setErrors(prev => ({
        ...prev,
        username: "Username must be from 2 to 20 characters",
      }));
      return;
    }

    if (password.length < 4) {
      setErrors(prev => ({
        ...prev,
        password: "Password must be at least 4 characters",
      }));
      return;
    }

    if (password !== confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    setIsLoading(true);

    try {
      const data = await registerUser(
        email,
        username,
        password
      );

      console.log("User registered:", data);

      onClose();

    } catch (err) {
         setErrors(prev => ({
          ...prev,
          server: "Registration failed",
        }));
    } finally {
      setIsLoading(false);
    }
  };
    
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-[90vw] max-w-md min-h-[500px] rounded-2xl bg-zinc-900 p-8">
                <div className="flex flex-col">
                    <div className="flex mb-5">
                        <button
                            type="button"
                            onClick={() => onSwitchToLogin()}
                            className="text-sm underline cursor-pointer hover:text-green-400"
                        >
                            <p className="hover:text-[15px]">Log in</p>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-auto hover:cursor-pointer"
                        >
                            <X size={25} />
                        </button>
                    </div>
                    <div className="w-full max-w-md rounded-xl flex flex-col gap-4">
                        <header className={`${inter.className} flex justify-center font-sans text-xl`}>
                            Create an account
                        </header>
                    <form
                        onSubmit={(e) => {
                        e.preventDefault()
                        handleRegister()}}
                        className="flex flex-col gap-5"
                    >
                        <div>
                        <label className={`${inter.className} mb-1`}>Email address</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type = "text"
                            placeholder="example@gmail.com"
                            value = {email}
                            className={`rounded-lg border p-2 w-full ${
                                errors.email
                                ? "border-red-500"
                                : "border-zinc-500 focus:border-green-500"
                            }`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                        </div>
                        <div>
                        <label className={`${inter.className} mb-1`}>Enter your name (username)</label>
                        <input
                            value={username}
                            onChange={(e)=>setUsername(e.target.value)}
                            className={`w-full rounded-lg border p-2 ${
                                errors.username
                                ? "border-red-500"
                                : "border-zinc-500"
                            }`}
                            placeholder="JohnTheFoodCritic"
                            />
                            {errors.username && (
                            <p className="text-sm text-red-500">
                                {errors.username}
                            </p>
                            )}
                        </div>
                        <div>
                        <label className={`${inter.className} mb-1`}>Create password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            className={`w-full rounded-lg border p-2 ${
                                errors.password
                                ? "border-red-500"
                                : "border-zinc-500"
                            }`}
                            />
                            {errors.password && (
                            <p className="text-sm text-red-500">
                                {errors.password}
                            </p>
                            )}
                        </div>
                        <div>
                        <label className={`${inter.className} mb-1`}>Confirm password</label>
                         <input
                            type="password"
                            value={confirmPassword}
                            placeholder="Confirm password"
                            onChange={(e)=>setConfirmPassword(e.target.value)}
                            className={`w-full rounded-lg border p-2 ${
                                errors.confirmPassword
                                ? "border-red-500"
                                : "border-zinc-500"
                            }`}
                            />
                            {errors.confirmPassword && (
                            <p className="text-sm text-red-500">
                                {errors.confirmPassword}
                            </p>
                            )}
                        </div>
                         {errors.server && (
                        <p className="text-center text-sm text-red-500">
                        {errors.server}
                        </p>
                        )}
                        <div className="flex justify-center">
                        <button
                            type = "submit"
                            disabled={isLoading}
                            className={`${inter.className} bg-green-500 w-100 h-13 rounded-full hover:cursor-pointer hover:bg-green-600`}
                        >
                            {isLoading ? "Creating..." : "Register"}
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { loginUser } from "@/app/services/auth.service";
import { X } from "lucide-react";
import { useTokenStore } from "@/stores/auth.sotres";

const inter = Inter({
  subsets: ["latin"],
});

type LoginFormProps = {
    onClose: () => void;
    onSwitchToRegister: () => void;
};

type Errors = {
  email: string;
  password: string;
  server: string;
};

const emptyErrors: Errors = {
  email: "",
  password: "",
  server: "",
};

export default function LoginForm({ onClose, onSwitchToRegister } : LoginFormProps){
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errors, setErrors] = useState<Errors>(emptyErrors)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const setAccessToken = useTokenStore(state => state.setAccessToken);

    const handleLogin = async () => {
    setErrors(emptyErrors);

    setIsLoading(true);

    try {
      const data = await loginUser(
        email,
        password
      );

      console.log("User logged in:", data);

      setAccessToken(data.accessToken);

      onClose();

    } catch (err) {
         setErrors(prev => ({
          ...prev,
          server: "Failed to log in",
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
                            onClick={() => onSwitchToRegister()}
                            className="text-sm underline cursor-pointer hover:text-green-400"
                        >
                            <p className="hover:text-[15px]">Sign in</p>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-auto hover:cursor-pointer"
                        >
                            <X size={25} />
                        </button>
                    </div>
                    <div className="max-w-md rounded-xl flex flex-col justify-center h-[350px] gap-4">
                        <header className={`${inter.className} flex justify-center font-sans text-xl`}>
                            Log in to your account
                        </header>
                    <form
                        onSubmit={(e) => {
                        e.preventDefault()
                        handleLogin()}}
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
                        <label className={`${inter.className} mb-1`}>Password</label>
                        <input
                            type="password"
                            value={password}
                            placeholder="Password"
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
                         {errors.server && (
                        <p className="text-center text-sm text-red-500">
                        {errors.server}
                        </p>
                        )}
                        <div className="flex justify-center">
                        <button
                            type = "submit"
                            disabled={isLoading}
                            className={`${inter.className}  bg-green-500 w-100 h-13 rounded-full hover:cursor-pointer hover:bg-green-600`}
                        >
                            {isLoading ? "Logging in..." : "Log in"}
                        </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
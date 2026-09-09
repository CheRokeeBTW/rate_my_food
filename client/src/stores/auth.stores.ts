import { create } from "zustand";

interface AuthState {
    accessToken: string | null;
    isInitialized: boolean;

    setAccessToken: (token: string | null) => void;
    setInitialized: (value: boolean) => void;
};

export const useTokenStore = create<AuthState>((set) => ({
    accessToken: null,
    isInitialized: false,

    setAccessToken: (accessToken) => set({ accessToken }),
    setInitialized: (isInitialized) => set({ isInitialized })
}))
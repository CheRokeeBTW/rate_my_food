"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "../services/token.service";
import { useTokenStore } from "@/stores/auth.sotres";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const setAccessToken = useTokenStore(state => state.setAccessToken);
    const setInitialized = useTokenStore(state => state.setInitialized);

    useEffect(() => {
        async function initializeAuth() {
            try {
                const data = await refreshAccessToken();

                setAccessToken(data)
            } catch {
                setAccessToken(null);
            } finally {
                setInitialized(true);
            }
        }

        initializeAuth();
    }, [setAccessToken, setInitialized]);

    return children;
}
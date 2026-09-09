"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "../services/token.service";
import { useTokenStore } from "@/stores/auth.stores";

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
                await refreshAccessToken();
            } finally {
                setInitialized(true);
            }
        }

        initializeAuth();
    }, [setAccessToken, setInitialized]);

    return children;
}
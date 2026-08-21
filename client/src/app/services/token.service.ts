import { useTokenStore } from "@/stores/auth.sotres";

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                useTokenStore.getState().setAccessToken(null);
                return null;
            }

            const data = await response.json();

            useTokenStore
                .getState()
                .setAccessToken(data.accessToken);

            return data.accessToken;
        } catch {
            useTokenStore.getState().setAccessToken(null);
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiFetch(
    input: RequestInfo | URL,
    init: RequestInit = {},
) {
    const accessToken =
        useTokenStore.getState().accessToken;

    const headers = new Headers(init.headers);

    if (accessToken) {
        headers.set(
            "Authorization",
            `Bearer ${accessToken}`,
        );
    }

    let response = await fetch(input, {
        ...init,
        headers,
        credentials: "include",
    });

    if (response.status !== 401) {
        return response;
    }

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
        return response;
    }

    const retryHeaders = new Headers(init.headers);

    retryHeaders.set(
        "Authorization",
        `Bearer ${newAccessToken}`,
    );

    response = await fetch(input, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
    });

    return response;
}
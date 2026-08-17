import { getAccessToken } from "./token.service";

export type CreateRating = {
    value: number;
    postId: string;
}

export async function createRating({ value, postId }: CreateRating){
    const accessToken = getAccessToken();

    if(!accessToken){
        throw new Error("You must be logged in")
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ratings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ value, postId }),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(
            data.message || "Failed to create post",
        );
    };

    return data;
};

export async function getRating(postId: string){
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ratings/post/${postId}/stats`)

    if(!response.ok){
        throw new Error('Failed to get post rating');
    }

    return response.json();
}
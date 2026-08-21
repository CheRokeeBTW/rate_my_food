import { apiFetch } from "./token.service";

export type CreateRating = {
    value: number;
    postId: string;
}

export async function createRating({ value, postId }: CreateRating){

    const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/ratings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
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
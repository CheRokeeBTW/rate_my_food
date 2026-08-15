import { getAccessToken } from "./token.service";

type CreatePostData = {
  title: string;
  imageUrl: string;
};

export async function createPost({ title, imageUrl } : CreatePostData) {
    const accessToken = getAccessToken();

    if (!accessToken) {
        throw new Error("You must be logged in");
    };

    const response =  await fetch (`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title, imageUrl }),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(
            data.message || "Failed to create post",
        );
    };

    return data
}
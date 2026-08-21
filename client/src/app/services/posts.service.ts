import { apiFetch } from "./token.service";

type CreatePostData = {
  title: string;
  imageUrl: string;
};

export async function createPost({ title, imageUrl } : CreatePostData) {

    const response =  await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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
};

export type FeedPost = {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
};

export type FeedResponse = {
  items: FeedPost[];
  nextCursor: string | null;
};

export async function getFeed( cursor?: string ): Promise<FeedResponse> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/posts/feed`;

  if (cursor) {
    url += `?cursor=${encodeURIComponent(cursor)}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load feed");
  }

  return response.json();
};

export async function markPostViewed(postId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/view`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.message || "Failed to mark post as viewed"
    );
  }

  return response.json();
}
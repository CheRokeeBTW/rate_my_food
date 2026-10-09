import { apiFetch } from "./token.service";

type CreatePostData = {
  title: string;
  tags: string[];
  imageUrl: string;
};

type createPostSubmission = CreatePostData & {
  publicId: string;
}

export type FeedPost = {
  id: string;
  title: string;
  tags: string[];
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

export async function createPost({ title, tags, imageUrl } : CreatePostData) {

    const response =  await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, tags, imageUrl }),
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Failed to create post")
    };

    return data
};


export async function getFeed( cursor?: string ): Promise<FeedResponse> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/posts/feed`;

  if (cursor) {
    url += `?cursor=${encodeURIComponent(cursor)}`;
  }

  const response = await apiFetch(url);

  if (!response.ok) {
    throw new Error("Failed to load feed");
  }

  return response.json();
};

export async function markPostViewed(postId: string) {
  const response = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/view`,
    {
      method: "POST",
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

export async function createPostSubmission({ title, tags, imageUrl, publicId } : createPostSubmission){
  const response = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/post-submissions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, tags, imageUrl, publicId })
    }
  );

  const data = await response.json();

  if(!response.ok){
    throw new Error(data.message || 'Failed to submit this post for moderation')
  }

  return data;
}


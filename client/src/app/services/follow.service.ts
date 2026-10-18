import { apiFetch } from "./token.service";

export async function followUser(followingId: string){
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/follow/${followingId}`,
        {
            method: "POST",
            credentials: "include"
        })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || 'failed to follow user')
    };

    return data
}

export async function getFollowers(cursor?: string){
    let url = `${process.env.NEXT_PUBLIC_API_URL}/follow`;

      if (cursor) {
        url += `?cursor=${encodeURIComponent(cursor)}`;
    }

    const response = await apiFetch(
        `${url}`,
    {
        method: "GET",
        credentials: "include"
    })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Failed to retrieve follow list")
    };

    return data
};

export async function unfollowUser(followingId: string){
    const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/follow/${followingId}`,
        {
            method: "DELETE",
            credentials: "include"
        })

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message || "Failed to unfollow user")
    };

    return data
};
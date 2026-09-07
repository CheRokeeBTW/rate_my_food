import { apiFetch } from "./token.service";

export async function getUserProfile() {
  const response = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/me`)

  const data = await response.json();

  if(!response.ok){
    throw new Error(
        data.message || "Failed to fetch posts",
    );
  }

  return data
}

export async function updateUsername(newUsername: string) {
  const response = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/me/username`,{
      method: "PATCH",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newUsername })
    }
  )

  const data = await response.json();

  if(!response.ok){
    throw new Error(
      data.message || 'Failed to update username'
    );
  }
}
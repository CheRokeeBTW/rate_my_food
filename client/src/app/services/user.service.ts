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
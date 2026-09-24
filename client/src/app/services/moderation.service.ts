import { apiFetch } from "./token.service";

export async function rejectPostSubmission(postId: string){
  const response = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/moderation/submissions/${postId}/reject`,
    {
      method: 'POST',
    }
  );

  if(!response.ok) throw new Error();

  return response.json();
}
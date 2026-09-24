import { apiFetch } from "./token.service";

export async function getPostsSubmissions(){
  const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/moderation`);

  if(!response.ok){
    throw new Error('Failed to get posts')
  };

  return response.json()
}

export async function approvePostSubmission(submissionId: string){
  const response = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/moderation/submissions/${submissionId}/approve`,
    {
      method: "POST",
    }
  );

  if(!response.ok) throw new Error();

  return response.json();
}

export async function rejectPostSubmission(submissionId: string){
  const response = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/moderation/submissions/${submissionId}/reject`,
    {
      method: 'POST',
    }
  );

  if(!response.ok) throw new Error();

  return response.json()
}
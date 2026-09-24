export type Post = {
    averageRating: number | null;
    id: string;
    createdAt: string;
    imageUrl: string;
    title: string;
}

export type SubmittedPost = {
    id: string;
    title: string;
    imageUrl: string;
    publicId: string;
    createdAt: string;
    status: string;
}
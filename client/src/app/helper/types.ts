export type Post = {
    averageRating: number | null;
    id: string;
    tags: string[];
    createdAt: string;
    imageUrl: string;
    title: string;
}

export type SubmittedPost = {
    id: string;
    title: string;
    tags: string[];
    imageUrl: string;
    publicId: string;
    createdAt: string;
    status: string;
}
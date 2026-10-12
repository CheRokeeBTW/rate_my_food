type AuthorT = {
    id: string;
    username: string;
}

export type Post = {
    averageRating: number | null;
    id: string;
    tags: string[];
    description: string | null;
    createdAt: string;
    imageUrl: string;
    title: string;
    author: AuthorT;
}

export type SubmittedPost = Post & {
    status: string;
}
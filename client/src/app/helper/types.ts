import { ReactNode } from "react";

type AuthorT = {
    id: string;
    username: string;
    avatarUrl: string | null;
};

export type Post = {
    averageRating: number | null;
    id: string;
    tags: string[];
    description: string | null;
    createdAt: string;
    imageUrl: string;
    title: string;
    ratingCount: number;
    author: AuthorT;
    isFollowing: boolean;
};

export type SubmittedPost = Post & {
    status: string;
};

export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  original_filename: string;
};

export type UploadPromise<T> = Promise<T> & {
  abort: () => void;
};

export type CreatePostData = {
  title: string;
  tags: string[];
  description: string | null;
  imageUrl: string;
};

export type createPostSubmissionT = CreatePostData & {
  publicId: string;
};

export type FeedResponse = {
  items: Post[];
  nextCursor: string | null;
};

export type CreateRatingT = {
    value: number;
    postId: string;
};

export type LoginFormProps = {
    onClose: () => void;
    onSwitchToRegister: () => void;
};

export type Errors = {
  email: string;
  password: string;
  server: string;
};

export type UserAvatarProps = {
  username: string;
  avatarUrl?: string | null;
  size?: number | string;
  className?: string;
};

export type AvatarCropModalProps = {
  file: File;
  onClose: () => void;
  onUploaded: (url: string) => void;
};

export type AverageRatingProps = {
    rating: number | null;
};

export type FeedProps = {
    onRequireAuth: () => void;
};

export type FoodCardProps = {
  post: Post;
  onSwipeLeft: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  canGoPrevious: boolean;
  ratingSlot: ReactNode;
};

export type RatingProps = {
    postId: string;
    onRate: (value: number) => void;
    onRequireAuth: () => void;
};

export type NavBarProps = {
    onRequireAuth: () => void;
};

export type UploadModalProps = {
    onClose: () => void;
};

export type CropRatio = {
    label: string;
    value: number;
};
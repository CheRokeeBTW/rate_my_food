"use client"

import FoodCard from "./FoodCard"
import FoodImg from '../../../public/FoodImg.jpeg';
import SecondFoodImg from '../../../public/Siritho_iPhone_Food-2.jpg'
import Rating from "./RatingBar";
import { useRouter } from "next/navigation";
import { getFeed, FeedPost, markPostViewed } from "@/app/services/posts.service";
import { useState, useEffect } from "react";
import { createRating, CreateRating } from "@/app/services/rating.service";
import { useTokenStore } from "@/stores/auth.stores";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FeedProps = {
    onRequireAuth: () => void;
};

const INITIAL_POSTS = 5;
const PREFETCH_THRESHOLD = 2;

export function Feed({ onRequireAuth } : FeedProps){
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    // const router = useRouter();
    const currentPost = posts[currentIndex];
    const token = useTokenStore(state => state.accessToken);
    const isInitialized = useTokenStore(state => state.isInitialized);

    console.log(token, "TOKEN");

    console.log(currentPost);

    useEffect(() => {
        if(!isInitialized) return;

        loadInitialFeed();
    }, [isInitialized]);

    const loadInitialFeed = async () => {
        try {
            setIsFetching(true);

            const data = await getFeed();

            setPosts(data.items);
            setNextCursor(data.nextCursor);
        } catch (err) {
            console.error("Failed to load feed:", err);
        } finally {
            setIsFetching(false);
        }
    };

    const loadMorePosts = async () => {
        if (!nextCursor || isFetching) {
            return [];
        }

        try {
            setIsFetching(true);

            const data = await getFeed(nextCursor);

            setPosts(prev => [
                ...prev,
                ...data.items,
            ]);

            setNextCursor(data.nextCursor);

            return data.items;
        } catch (err) {
            console.error("Failed to load more posts:", err);
            return [];
        } finally {
            setIsFetching(false);
        }
    };
    
    const handleNext = async () => {
        if (!currentPost) {
            return;
        }

        try {
            await markPostViewed(currentPost.id);

            const nextIndex = currentIndex + 1;

            if (nextIndex < posts.length) {
                setCurrentIndex(nextIndex);

                const postsRemaining =
                    posts.length - nextIndex - 1;

                if (
                    postsRemaining <= PREFETCH_THRESHOLD &&
                    nextCursor
                ) {
                    loadMorePosts();
                }

                return;
            }

            await loadMorePosts();

            setCurrentIndex(nextIndex);
        } catch (error) {
            console.error("Failed to move to next post:", error);
        }
    };

    const handlePrevious = () => {
        if (currentIndex === 0) {
            return;
        }

        setCurrentIndex(prev => prev - 1);
    };

    const handleRate = async (value: number) => {
        if(!currentPost){
            return
        };

        try{
            await createRating({ value, postId: currentPost.id });
        }
        catch (error) {
            console.error(error);
        }

        await handleNext();
    };

    console.log(posts, "POSTS");
    console.log(currentPost, "CURRENT POST");

    if (!currentPost) {
        return (
            <div className="flex justify-center">
                Loading...
            </div>
        );
    }

    return(
        <div className="flex items-center justify-center gap-4 px-4">
            <div className="w-full max-w-[650px]">
                <FoodCard
                    post={currentPost}
                    onSwipeLeft={handleNext}
                    handleNext={handleNext}
                    handlePrevious={handlePrevious}
                    canGoPrevious={currentIndex > 0}
                />
                <Rating
                    postId={currentPost.id}
                    onRate={handleRate}
                    onRequireAuth={onRequireAuth}
                />
        </div>
    </div>
    )
}
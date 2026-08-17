"use client"

import FoodCard from "./FoodCard"
import FoodImg from '../../../public/FoodImg.jpeg';
import SecondFoodImg from '../../../public/Siritho_iPhone_Food-2.jpg'
import Rating from "./RatingBar";
import { useRouter } from "next/navigation";
import { getFeed, FeedPost } from "@/app/services/posts.service";
import { useState, useEffect } from "react";
import { createRating, CreateRating } from "@/app/services/rating.service";

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
    const router = useRouter();
    const currentPost = posts[currentIndex];

    console.log(currentPost);

    useEffect(() => {
        loadInitialFeed();
    }, []);

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
            return;
        }

        try {
            setIsFetching(true);

            const data = await getFeed(nextCursor);

            setPosts(prev => [
                ...prev,
                ...data.items,
            ]);

            setNextCursor(data.nextCursor);
        } catch (err) {
            console.error("Failed to load more posts:", err);
        } finally {
            setIsFetching(false);
        }
    };
    
    const handleNext = async () => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= posts.length) {
            return;
        }

        setCurrentIndex(nextIndex);

        const postsRemaining =
            posts.length - nextIndex - 1;

        if (
            postsRemaining <= PREFETCH_THRESHOLD &&
            nextCursor
        ) {
            await loadMorePosts();
        }
    };

    const handleRate = async (value: number) => {
        if(!currentPost){
            return
        };

        try{
            const data = await createRating({ value, postId: currentPost.id });
        }
        catch (error) {
            console.error(error);
        }
    };

    if (!currentPost) {
        return (
            <div className="flex justify-center">
                Loading...
            </div>
        );
    }

    return(
        <div>
            <FoodCard post={currentPost} />
            <Rating onRate={handleRate} onRequireAuth={onRequireAuth}/>
        </div>
    )
}
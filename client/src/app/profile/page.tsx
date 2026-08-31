"use client"

import { useState, useEffect } from "react";
import { getUserProfile } from "@/app/services/user.service";
import Image from "next/image";
import { Post } from "../helper/types";
import AverageRating from "@/components/feed/AverageRating";

export default function Profile () {
    const [posts, setPosts] = useState<Post[]>([]);
    const [username, setUsername] = useState<String>(""); 
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getPosts();
    }, []);

    const getPosts = async () => {
        try{
            setIsLoading(true);

            const data = await getUserProfile();

            console.log(data, "DATA");

            setPosts(data.posts);
            setUsername(data.username);
        } catch (err){
            console.error("Failed to fetch posts", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    console.log(posts, "ONLY POSTS");

    return (
        <div className="px-20 pt-5 flex flex-col gap-15">
            <div className="flex justify-center text-2xl">
                {username}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {posts.map((post) => (
                    <div key = {post.id}>
                        <p className="flex justify-center">{post.title}</p>
                        <Image
                            alt="postImg"
                            src={post.imageUrl}
                            width={400}
                            height={400}
                        />
                        <div className="mt-2 flex justify-center">
                            <AverageRating rating={post.averageRating} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 
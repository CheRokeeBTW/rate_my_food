"use client"

import { useState, useEffect, useTransition } from "react";
import { getUserProfile, updateUsername } from "@/app/services/user.service";
import Image from "next/image";
import { Post } from "../helper/types";
import AverageRating from "@/components/feed/AverageRating";
import editImg from '../../../public/modify-icon.svg';

export default function Profile () {
    const [posts, setPosts] = useState<Post[]>([]);
    const [username, setUsername] = useState<string>(""); 
    const [newUsername, setNewUsername] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUsernameLoading, startTransition] = useTransition();
    const [ischangingName, setIsChangingName] = useState<boolean>(false);
    const postsWithRating = posts.map(post => post.averageRating).filter(rating => rating !== null);

    const total = postsWithRating.reduce((sum, postRating) => {
        return sum + postRating
    }, 0);

    const average = postsWithRating.length > 0
        ? total / postsWithRating.length
        : 0;

    console.log(postsWithRating, "AVERAGE");

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

    const openUpdateUsername = () => {
        setNewUsername(username);
        setIsChangingName(true);
    }

    const handleUpdateUsername = () => {
            startTransition(async () => {
                try {
                    await updateUsername(newUsername);

                    setUsername(newUsername);
                    setIsChangingName(false);
                } catch (err) {
                    console.error("Failed to update username", err);
                }
            })
    }
    
    console.log(posts, "ONLY POSTS");

    if(isLoading) return(
        <div className="flex justify-center items-center h-screen">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen px-6 md:px-12 lg:px-20 pt-8 pb-16">
            <div className="flex flex-col items-center mb-12">
                {!isUsernameLoading ? (
                    <div className="flex items-center gap-3 mb-5">
                        {ischangingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    className="w-48 px-3 py-1.5 text-2xl font-bold outline-none border-b text-center"
                                    autoFocus
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                />
                                    <button
                                        className="min-w-8 h-8 rounded-full flex items-center justify-center bg-blue-700 hover:bg-blue-600 transition-colors hover:cursor-pointer"
                                        onClick={handleUpdateUsername}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        className="min-w-8 h-8 rounded-full flex items-center justify-center bg-red-700 hover:bg-red-600 transition-colors hover:cursor-pointer"
                                        onClick={() => setIsChangingName(false)}
                                    >
                                        ✕
                                    </button>
               
                            </div>
                        ) : (
                            <>
                                <p className="text-3xl font-bold tracking-tight">
                                    {username}
                                </p>
                                <button 
                                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-800 transition-colors duration-200 hover:cursor-pointer"
                                    onClick={openUpdateUsername}
                                >
                                    <Image
                                        src={editImg}
                                        alt="Edit profile"
                                        width={16}
                                        height={16}
                                    />
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    'Updating...'
                )}
                <div className="flex items-center bg-zinc-900/70 border border-zinc-800 rounded-2xl px-8 py-4 shadow-sm">
                    <div className="flex flex-col items-center min-w-24">
                        <span className="text-xl font-bold">
                            {posts.length}
                        </span>
                        <span className="text-sm text-zinc-500">
                            Posts
                        </span>
                    </div>
                    <div className="h-8 w-px bg-zinc-700 mx-6" />
                    <div className="flex flex-col items-center min-w-24">
                        <span className="text-xl font-bold">
                            {average.toFixed(1)}
                        </span>
                        <span className="text-sm text-zinc-500">
                            Avg. rating
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="group overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl"
                    >
                        <div className="relative aspect-square overflow-hidden">
                            <Image
                                alt={post.title}
                                src={post.imageUrl}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-4 flex flex-col items-center">
                            <p className="text-lg font-semibold tracking-tight truncate">
                                {post.title}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                                <AverageRating rating={post.averageRating} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 
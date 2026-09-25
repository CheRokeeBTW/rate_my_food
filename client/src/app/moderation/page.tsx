"use client"

import { useState, useEffect } from "react";
import { SubmittedPost } from "../helper/types";
import { approvePostSubmission, getPostsSubmissions, rejectPostSubmission } from "../services/moderation.service";
import Image from "next/image";

export default function Moderation() {
    const [submissions, setSubmissions] = useState<SubmittedPost[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        loadPendingSubmissions();
    }, []);

    const loadPendingSubmissions = async(): Promise<void> => {
        try{
            setIsLoading(true);

            const data = await getPostsSubmissions();
            console.log(data, "SUBMITTED DATA");
            setSubmissions(data);
        } catch (err) {
            console.error("Failed to fetch submitted posts for moderation")
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveSubmission = async (submissionId: string): Promise<void> => {
        try{
            await approvePostSubmission(submissionId);
        } catch (err){
            console.error("Failed to approve this post")
        } 
    };

    const handleRejectSubmission = async (submissionId: string): Promise<void> => {
        try{
           await rejectPostSubmission(submissionId);

           setSubmissions((prevSubmission) => prevSubmission.filter((submission) => submission.id !== submissionId)) 
        } catch (err){
            console.error("Failed to reject this post")
        }
    };

    if(isLoading) return(
        <div className="flex justify-center items-center h-screen">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-white rounded-full animate-spin"></div>
        </div>
    );
    
return (
    <div className="min-h-screen px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    Moderation
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                    Review submitted posts before they appear publicly.
                </p>
            </div>
            {submissions.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
                    <div className="text-center">
                        <p className="text-lg font-medium text-gray-200">
                            No pending submissions
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            There are currently no posts waiting for review.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {submissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-lg hover:scale-1.5"
                        >
                            <div className="relative aspect-square w-full overflow-hidden bg-gray-800">
                                <Image
                                    src={submission.imageUrl}
                                    alt={submission.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-5">
                                <h2 className="truncate text-lg font-semibold text-white">
                                    {submission.title}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Submitted for review
                                </p>
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() =>
                                            handleApproveSubmission(
                                                submission.id
                                            )
                                        }
                                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm
                                            font-semibold text-white transition hover:bg-green-500
                                            active:scale-[0.98] hover:cursor-pointer"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleRejectSubmission(
                                                submission.id
                                            )
                                        }
                                        className="rounded-xl bg-red-600 px-4 py-2.5
                                        text-sm font-semibold text-white transition
                                        hover:bg-red-500 active:scale-[0.98] hover:cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);
}
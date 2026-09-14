import Image from "next/image";
import { useEffect } from "react";
import { FeedPost } from "@/app/services/posts.service";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FoodCardProps = {
    post: FeedPost;
    onSwipeLeft: () => void;
    handleNext: () => void;
    handlePrevious: () => void;
    canGoPrevious: boolean;
};

export default function FoodCard({
    post,
    onSwipeLeft,
    handleNext,
    handlePrevious,
    canGoPrevious,
}: FoodCardProps) {
    const x = useMotionValue(0);

    const rotate = useTransform(
        x,
        [-400, 0],
        [-12, 0]
    );

    const opacity = useTransform(
        x,
        [-500, -250, 0],
        [0.4, 1, 1]
    );

    useEffect(() => {
        x.set(-40);

        animate(x, 0, {
            duration: 0.25,
            ease: "easeOut",
        });
    }, [post.id, x]);

    return (
        <motion.div
            className="w-full max-w-[650px] mx-auto"
            style={{
                x,
                rotate,
                opacity,
                touchAction: "pan-y",
            }}
            drag="x"
            dragConstraints={{
                left: -1000,
                right: 0,
            }}
            dragElastic={0}
            onDragEnd={(_, info) => {
                if (info.offset.x < -120) {
                    animate(x, -800, {
                        duration: 0.3,
                        ease: "easeOut",
                        onComplete: onSwipeLeft,
                    });
                } else {
                    animate(x, 0, {
                        duration: 0.2,
                        ease: "easeOut",
                    });
                }
            }}
        >
                <header className="flex justify-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                        {post.title}
                    </h1>
                </header>
                <article className="w-full">
                    <div className="flex gap-[15px]">
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={!canGoPrevious}
                                className="
                                    hidden sm:flex
                                    h-12 w-12
                                    shrink-0
                                    items-center justify-center
                                    rounded-full
                                    border border-zinc-800
                                    bg-zinc-900/80
                                    text-zinc-400
                                    transition
                                    hover:border-zinc-700
                                    hover:bg-zinc-800
                                    hover:text-white
                                    disabled:cursor-not-allowed
                                    disabled:opacity-30
                                    hover: cursor-pointer
                                "
                                aria-label="Previous post"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        </div>
                    <div className="relative aspect-[4/5] w-full h-150 overflow-hidden overflow-hidden rounded-[24px] border border-zinc-800">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            priority
                            draggable={false}
                            className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <p className="mt-1 text-sm text-zinc-300">
                                @{post.author.username}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            type="button"
                            onClick={handleNext}
                            className="
                                hidden sm:flex
                                h-12 w-12
                                shrink-0
                                items-center justify-center
                                rounded-full
                                border border-zinc-800
                                bg-zinc-900/80
                                text-zinc-400
                                transition
                                hover:border-zinc-700
                                hover:bg-zinc-800
                                hover:text-white
                                hover: cursor-pointer
                            "
                            aria-label="Next post"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                    </div>
                </article>
        </motion.div>
    );
}


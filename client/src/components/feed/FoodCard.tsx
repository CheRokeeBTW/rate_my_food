"use client";

import Image from "next/image";
import { useEffect, type ReactNode } from "react";
import { FeedPost } from "@/app/services/posts.service";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { ChevronLeft, ChevronRight, Bookmark, Share2 } from "lucide-react";

type FoodCardProps = {
  post: FeedPost;
  onSwipeLeft: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  canGoPrevious: boolean;
  ratingSlot: ReactNode;
};

export default function FoodCard({
  post,
  onSwipeLeft,
  handleNext,
  handlePrevious,
  canGoPrevious,
  ratingSlot,
}: FoodCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-400, 0], [-12, 0]);
  const opacity = useTransform(x, [-500, -250, 0], [0.4, 1, 1]);

  // Temporary mock data until the API provides these values.
  const averageRating = 8.7;
  const ratingCount = 124;

  useEffect(() => {
    x.set(-40);

    animate(x, 0, {
      duration: 0.25,
      ease: "easeOut",
    });
  }, [post.id, x]);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[900px]"
      style={{ x, rotate, opacity, touchAction: "pan-y" }}
      drag="x"
      dragConstraints={{ left: -1000, right: 0 }}
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
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT: Food image */}
        <div className="relative min-h-[380px] overflow-hidden rounded-[26px] border border-white/15 bg-[#25261f] sm:h-[min(72svh,680px)]">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            priority
            draggable={false}
            sizes="(max-width: 640px) 100vw, 52vw"
            className="object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Mobile author badge */}
          <div className="absolute bottom-5 left-5 flex items-center gap-3 sm:hidden">
            <div className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/15 text-xs font-bold text-white backdrop-blur">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {post.author.username}
              </p>
              <p className="text-[11px] text-white/65">Food contributor</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Information panel */}
        <aside className="flex min-h-[520px] flex-col rounded-[26px] border border-white/10 bg-[#1a1b17]/95 p-5 backdrop-blur-xl sm:h-[min(72svh,680px)] sm:p-7">
          {/* Author (desktop) */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-[#c79775] text-xs font-bold text-white">
              {post.author.username.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {post.author.username}
              </p>
              <p className="text-xs text-white/45">Food contributor</p>
            </div>

            <button
              type="button"
              aria-label="Follow author"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-black"
            >
              Follow
            </button>
          </div>

          {/* Title + tags */}
          <div className="mt-1 sm:mt-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff795c]">
              On the menu
            </p>

            <h2 className="break-words font-display text-[2rem] leading-[1.02] font-semibold tracking-[-0.04em] text-[#f7f3ea] sm:text-[2.45rem]">
              {post.title}
            </h2>

            {post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-white/65"
                  >
                    {tag.toLowerCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-7">
            {/* Average rating + actions */}
            <div className="mb-5 flex items-center gap-3 border-y border-white/10 py-4">
              <div className="font-display text-3xl font-semibold text-[#ff795c]">
                {averageRating.toFixed(1)}
              </div>

              <div className="leading-tight">
                <div
                  aria-label="5 out of 5 decorative stars"
                  className="text-xs tracking-[0.15em] text-[#ff795c]"
                >
                  ★★★★★
                </div>
                <p className="mt-1 text-[10px] text-white/35">
                  {ratingCount} community ratings
                </p>
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  aria-label="Save dish"
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <Bookmark size={17} />
                </button>

                <button
                  type="button"
                  aria-label="Share dish"
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <Share2 size={17} />
                </button>
              </div>
            </div>

            {/* Rating slot */}
            <div>
              <p className="mb-1 text-sm font-bold text-white">Rate this dish</p>
              <p className="mb-4 text-[11px] text-white/35">
                How good does it look?
              </p>

              {ratingSlot}
            </div>
          </div>
        </aside>
      </div>

      {/* Desktop navigation */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        aria-label="Previous post"
        className="absolute left-[-64px] top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/70 backdrop-blur transition hover:scale-105 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30 lg:flex"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next post"
        className="absolute right-[-64px] top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/25 text-white/70 backdrop-blur transition hover:scale-105 hover:bg-white hover:text-black lg:flex"
      >
        <ChevronRight size={24} />
      </button>
    </motion.div>
  );
}
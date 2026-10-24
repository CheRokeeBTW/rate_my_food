"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { getUserProfile, updateUsername } from "@/app/services/user.service";
import Image from "next/image";
import { Post } from "../helper/types";
import { getUsernameError } from "../helper/errorHandler";
import UserAvatar from "@/components/avatar/Avatar";
import AvatarCropModal from "@/components/avatar/AvatarCropModal";
import { Pencil, Camera, ArrowLeft, Grid3X3, Check, X } from "lucide-react";

export default function Profile() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [username, setUsername] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUsernameLoading, startTransition] = useTransition();
  const [isChangingName, setIsChangingName] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState <string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const postsWithRating = posts
    .map((post) => post.averageRating)
    .filter((rating): rating is number => rating !== null);

  const total = postsWithRating.reduce((sum, rating) => sum + rating, 0);
  const average = postsWithRating.length > 0 ? total / postsWithRating.length : 0;

  useEffect(() => {
    getPosts();
  }, []);

  const handleAvatarFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Choose a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 10 MB.");
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
  };

  const getPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getUserProfile();
      setPosts(data.posts);
      setUsername(data.username);
      setAvatar(data.avatarUrl);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateUsername = () => {
    setNewUsername(username);
    setUsernameError(null);
    setIsChangingName(true);
  };

  const closeUpdateUsername = () => {
    setUsernameError(null);
    setIsChangingName(false);
  }

  const handleUpdateUsername = () => {
    startTransition(async () => {
      try {
        await updateUsername(newUsername);
        setUsername(newUsername);
        setIsChangingName(false);
      } catch (err) {
          err instanceof Error ? setUsernameError(getUsernameError(err.message)) : setUsernameError("Failed to update username. Please try again");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#11120f]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#ff6542]" />
      </div>
    );
  }

  return (
    <main className="profile-page relative min-h-[100svh] bg-[#11120f] text-[#f7f3ea]">
      <div className="pointer-events-none fixed inset-0 profile-glow" />
      <div className="pointer-events-none fixed inset-0 noise" />

      {/* Header */}
      {/* <header className="relative z-30 flex h-[72px] items-center justify-between border-b border-white/10 px-5 sm:px-8">
        <a href="/" className="flex items-center gap-2.5" aria-label="Crumb home">
          <span className="grid size-8 -rotate-6 place-items-center rounded-[10px] bg-[#ff6542] text-sm font-black text-white shadow-[2px_2px_0_#f6e8c9]">
            C
          </span>
          <span className="font-display text-xl font-bold tracking-[-0.04em]">
            crumb.
          </span>
        </a>

        <a
          href="/"
          className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-white/65 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to feed
        </a>
      </header> */}

      <section className="relative z-10 mx-auto max-w-[1120px] px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <div className="group relative">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarFileChange}
            />

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="avatar-editor relative size-28 overflow-hidden rounded-full border border-white/15 bg-[#c79775] shadow-[0_20px_55px_rgba(0,0,0,.35)] sm:size-32"
              aria-label="Update profile photo"
            >
              <UserAvatar
                username={username}
                avatarUrl={avatar}
                size="100%"
                className="h-full w-full"
              />

              <span className="absolute inset-0 grid place-items-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                <span className="flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
                  <Camera size={20} />
                  Change
                </span>
              </span>
            </button>
          </div>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            Click photo to update
          </p>

        <div className="mt-7 w-full">
        
        <div className="profile-name-row grid min-h-[56px] w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
          {isChangingName ? (
            <>
            <div aria-hidden="true" className="w-30" />
                <label htmlFor="profile-name" className="sr-only">
                  Your name
                </label>

                <input
                  id="profile-name"
                  autoFocus
                  value={newUsername}
                  maxLength={30}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateUsername();
                      if (e.key === "Escape") setIsChangingName(false);
                  }}
                  className="flex flex-1 profile-name-input w-full min-w-0 bg-transparent text-center font-display text-[2.5rem] leading-none font-semibold tracking-[-0.045em] text-[#ff795c] outline-none transition placeholder:text-white/30 sm:text-[3.4rem]"
                  aria-describedby="name-hint"
                />

                <div
                  className="ml-8 flex items-center gap-2"
                  aria-label="Name editing actions"
                >
                <button
                    type="button"
                    onClick={handleUpdateUsername}
                    disabled={isUsernameLoading || !newUsername.trim()}
                    className="grid size-10 place-items-center rounded-full bg-[#ff6542] text-white transition hover:bg-[#ff795c] disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Save name"
                >
                    <Check size={20} />
                </button>

                <button
                    type="button"
                    onClick={closeUpdateUsername}
                    className="grid size-10 place-items-center rounded-full border border-white/15 text-white/55 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                    aria-label="Cancel name change"
                >
                  <X size={20} />
                </button>
                </div>
            </>
            ) : (
            <button
                type="button"
                onClick={openUpdateUsername}
                className="group relative col-span-3 mx-auto block max-w-full"
            >
                <h1 className="break-words font-display text-[2.5rem] leading-none font-semibold tracking-[-0.045em] text-[#f7f3ea] transition group-hover:text-[#ff795c] sm:text-[3.4rem]">
                  {username}
                </h1>

                <span className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100">
                <Pencil size={16} className="text-white/50" />
                </span>
            </button>
            )}
        </div>
        {usernameError && (
          <p
            role="alert"
            className="mt-3 text-center text-sm text-red-400"
          >
            {usernameError}
          </p>
        )}

        <p id="name-hint" className="mt-3 text-xs text-white/35">
            {isChangingName ? "Press Enter to save" : "Click your name to edit it"}
        </p>
        </div>

          {/* Handle */}
          <p className="mt-4 text-sm font-medium text-white/50">
            @{username.toLowerCase().replace(/\s+/g, ".")}
          </p>

          {/* Stats */}
          <div className="mt-8 flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
            <div className="min-w-32 px-8 py-4">
              <p className="font-display text-2xl font-semibold">{posts.length}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/35">
                Posts
              </p>
            </div>
            <div className="my-4 w-px bg-white/10" />
            <div className="min-w-32 px-8 py-4">
              <p className="font-display text-2xl font-semibold text-[#ff795c]">
                {average.toFixed(1)}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/35">
                Avg. rating
              </p>
            </div>
          </div>
        </div>

        {/* Collection header */}
        <div className="mt-16 flex items-end justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff795c]">
              Your collection
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
              Posts you’ve shared
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/40">
            <Grid3X3 size={14} />
            {posts.length} posts
          </div>
        </div>

        {/* Posts grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="profile-card group overflow-hidden rounded-[22px] border border-white/10 bg-[#1a1b17] text-left transition hover:-translate-y-1 hover:border-white/20"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <p className="line-clamp-2 font-display text-xl font-semibold leading-tight">
                    {post.title}
                  </p>
                </div>

                {post.averageRating !== null && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1.5 font-display text-sm font-semibold text-[#ff795c] backdrop-blur">
                    {post.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="mt-20 text-center text-white/40">
            <p className="text-lg">No dishes shared yet</p>
            <p className="mt-2 text-sm">Your collection will appear here</p>
          </div>
        )}
      </section>
      {avatarFile && (
        <AvatarCropModal
          file={avatarFile}
          onClose={() => setAvatarFile(null)}
          onUploaded={(url) => {
            setAvatar(url);
            setAvatarFile(null);
          }}
        />
      )}
    </main>
  );
}